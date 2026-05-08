const multer = require("multer")

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true)
    } else {
      cb(new Error("Only CSV files are allowed"))
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }
})

const uploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "error",
          message: "File too large. Maximum size is 100MB"
        })
      }
      return res.status(400).json({
        status: "error",
        message: error.message
      })
    }
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message
      })
    }
    next()
   })
}

module.exports = uploadMiddleware