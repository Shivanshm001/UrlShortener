const {Pool} = require('pg')

const pool = new Pool({
    // host: process.env.DB_RENDER_EXTERNAL_HOSTNAME,
    // port: process.env.DB_PORT,
    // database: process.env.DB_NAME,
    // user: process.env.DB_USERNAME,
    // password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_INTERNAL_URL,
    ssl: true
})

async function connectDB() {
    try {
        const client = await pool.connect();
        console.log(`Successfully connected to database.`);
        return client;
    } catch (error) {
        if (error) {
            console.error(`Error connecting to database: ${error.message}`);
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = connectDB;