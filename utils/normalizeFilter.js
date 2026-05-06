function normalizeFilter(query) {
  return Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      const val = query[key]
      acc[key] = typeof val === "string" ? val.toLowerCase().trim() : val
      return acc
    }, {})
}

module.exports = normalizeFilter