require("dotenv").config()
const app = require("./app")
const { connectDB } =  require("./config/db")


const PORT = process.env.PORT || 3100

connectDB()

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))