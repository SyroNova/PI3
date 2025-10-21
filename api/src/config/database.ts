import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || '127.0.0.1',
  port: Number(process.env.MYSQLPORT) || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'electromed',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

export default pool;

export async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connection test successful');
    conn.release();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ MySQL connection test failed:', message);
    throw err;
  }
}