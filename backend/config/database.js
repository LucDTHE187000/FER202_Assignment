const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'AssignmentDB',
    user: process.env.DB_USER || 'dat',
    password: process.env.DB_PASSWORD || '123',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false, // Set to true if using Azure SQL
        trustServerCertificate: true,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Connected to SQL Server successfully!');
        }
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return pool;
};

const closeDB = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed.');
        }
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};

module.exports = {
    connectDB,
    getPool,
    closeDB,
    sql
};
