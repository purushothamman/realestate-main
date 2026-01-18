require("dotenv").config();
const app = require("./app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await pool.getConnection();
        console.log("MySQL Database connected successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}

start();