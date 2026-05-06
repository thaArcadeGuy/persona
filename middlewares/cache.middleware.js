const axios = require("axios")
require("dotenv").config()
const { normalizeQuery, buildCacheKey } = require("../utils/normalizeQuery")

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function redisGet(key) {
  const res = await axios.get(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  })

  return res.data.result
}

async function redisSet(key, value, ttl = 60) {
  await axios.post(`${REDIS_URL}/set/${encodeURIComponent(key)}`, value, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    params: { EX: ttl }
  })
}

async function redisDelete(pattern) {
  const scanRes = await axios.get(`${REDIS_URL}/scan/0/${encodeURIComponent(pattern)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  })

  const keys = scanRes.data.result?.[1] ?? []
  if (keys.length === 0) return

  const keyPath = keys.map(k => encodeURIComponent(k)).join("/")
  await axios.delete(`${REDIS_URL}/del/${keyPath}`, null, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  })
}

const cacheMiddleware = (duration = 60) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next()

    const normalized = normalizeQuery(req.query)
    const key = buildCacheKey(normalized)

    try {
      const cached = await redisGet(key)

      if (cached) {
        return res.status(200).json(JSON.parse(cached))
      }

      const originalJson = res.json.bind(res)

      res.json = (body) => {
        redisSet(key, JSON.stringify(body), duration).catch(error => {
          console.warn("Failed to cache response:", error.message)
        })
        return originalJson(body)
      }

      next()
    } catch (error) {
      console.warn("Cache error, continuing:", error.message)
      next()
    }
  }
}

module.exports = { cacheMiddleware, redisDelete }