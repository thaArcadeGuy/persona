const ALLOWED_KEYS = [
  "gender", "age_group", "country_id",
  "min_age", "max_age",
  "min_gender_probability", "min_country_probability",
  "sort_by", "order", "page", "limit", "q"
]

const NUMERIC_KEYS = ["min_age", "max_age", "page", "limit"]
const FLOAT_KEYS = ["min_gender_probability", "min_country_probability"]

function normalizeQuery(filters) {
  const normalized = {}
  const sorted = Object.keys(filters)
    .filter(k => ALLOWED_KEYS.includes(k))
    .sort()                             

  for (const key of sorted) {
    const val = filters[key]
    if (val === undefined || val === null || val === "") continue

    if (NUMERIC_KEYS.includes(key)) {
      const n = Number(val)
      if (!Number.isNaN(n)) normalized[key] = n
    } else if (FLOAT_KEYS.includes(key)) {
      const f = parseFloat(val)
      if (!Number.isNaN(f)) normalized[key] = f
    } else if (typeof val === "string") {
      normalized[key] = val.toLowerCase().trim()
    } else {
      normalized[key] = val
    }
  }

  return normalized
}

function buildCacheKey(normalized) {
  const parts = Object.entries(normalized)
    .map(([k, v]) => `${k}=${v}`)
    .join(":")

  return parts ? `profiles:${parts}` : "profiles:all"                        
}

module.exports = { normalizeQuery, buildCacheKey }