require("dotenv").config()
const app = require("./app")

const PORT = process.env.PORT || 3100


if (process.env.NODE_ENV !== "production") {
  const { connectDB } = require("./config/db")
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  })
}

module.exports = app