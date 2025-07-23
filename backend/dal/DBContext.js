const sql = require('mssql');

const config = {
  user: 'dat',
  password: '123',
  server: 'localhost', // hoặc 'localhost\\SQLEXPRESS' nếu dùng instance SQLEXPRESS
  database: 'AssignmentDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  port: 1433
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = {
  sql, poolPromise
};
