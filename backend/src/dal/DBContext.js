const sql = require('mssql');

class DBContext {
    constructor() {
        // Không khởi tạo connection trong constructor
        // Connection sẽ được khởi tạo khi cần thiết
    }

    async initializeConnection() {
        try {
            if (DBContext.pool) {
                return DBContext.pool; // Nếu đã có connection, return luôn
            }

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

            DBContext.pool = await sql.connect(config);
            console.log('JDBC Driver loaded successfully!');
            console.log('Database connected successfully!');
            return DBContext.pool;
        } catch (error) {
            console.error('Database connection failed:', error.message);
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async getPool() {
        if (!DBContext.pool) {
            await this.initializeConnection();
        }
        return DBContext.pool;
    }

    async closeConnection() {
        try {
            if (DBContext.pool) {
                await DBContext.pool.close();
                DBContext.pool = null;
                console.log('Database connection closed.');
            }
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }

    // Abstract methods - should be implemented by child classes
    async list() {
        throw new Error('Method list() must be implemented by child class');
    }

    async get(id) {
        throw new Error('Method get() must be implemented by child class');
    }

    async insert(model) {
        throw new Error('Method insert() must be implemented by child class');
    }

    async update(model) {
        throw new Error('Method update() must be implemented by child class');
    }

    async delete(model) {
        throw new Error('Method delete() must be implemented by child class');
    }

    // Utility method for executing queries
    async executeQuery(query, params = {}) {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            
            // Add parameters to request
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });

            const result = await request.query(query);
            return result;
        } catch (error) {
            console.error('Query execution error:', error);
            throw error;
        }
    }

    // Utility method for executing stored procedures
    async executeStoredProcedure(procedureName, params = {}) {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            
            // Add parameters to request
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });

            const result = await request.execute(procedureName);
            return result;
        } catch (error) {
            console.error('Stored procedure execution error:', error);
            throw error;
        }
    }
}

// Static property to hold the connection pool
DBContext.pool = null;

module.exports = DBContext;
