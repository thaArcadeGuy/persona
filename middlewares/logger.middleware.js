const logger = (req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const safeUrl = req.originalUrl.split("?")[0]
    console.log(`${req.method} ${safeUrl} ${res.statusCode} - ${duration}ms`)
  })
  next()
}

module.exports = logger