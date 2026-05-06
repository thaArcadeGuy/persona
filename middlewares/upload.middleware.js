const multer = require("multer")
const path = require("node:path")

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_")
    cb(null, `${Date.now()}-${safeName}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true)
    } else {
      cb(new Error("Only CSV files are allowed"))
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
})

module.exports = upload