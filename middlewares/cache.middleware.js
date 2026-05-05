const axios = require("axios")
const crypto = require("node:crypto")
require("dotenv").config()

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function redisGet(key) {
  const res = await axios.get(`${REDIS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  })

  return res.data.result
}

async function redisSet(key, value, ttl = 60) {
  await axios.post(`${REDIS_URL}/set/${key}`, value, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    params: { EX: ttl }
  })
}

const cacheMiddleware = (duration = 60) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next()

    const normalizedQuery = Object.keys(req.query)
      .sort()
      .reduce((acc, k) => {
        const val = req.query[k]
        acc[k] = typeof val === "string" ? val.toLowerCase() : val
        return acc
      }, {})

    const keyHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(normalizedQuery))
      .digest("hex")
      .slice(0, 16)
    
    const key = `profiles:${keyHash}`

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

module.exports = cacheMiddleware