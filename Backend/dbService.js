// All database queries. execute() with ? placeholders keeps user input out of the SQL.
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'web_app',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

// Exclude password hashes from search responses.
const visibleColumns = 'username, firstname, lastname, salary, age, registerday, signintime';

async function registerUser({ username, passwordHash, firstname, lastname, salary, age }) {
  const sql = `INSERT INTO Users
    (username, password, firstname, lastname, salary, age, registerday, signintime)
    VALUES (?, ?, ?, ?, ?, ?, CURDATE(), NULL)`;
  await pool.execute(sql, [username, passwordHash, firstname, lastname, salary, age]);
}

async function findLoginUser(username) {
  const [rows] = await pool.execute(
    'SELECT username, password FROM Users WHERE username = ?', [username]
  );
  return rows[0] || null;
}

async function recordSuccessfulSignIn(username) {
  await pool.execute('UPDATE Users SET signintime = NOW() WHERE username = ?', [username]);
}

async function searchByName(firstname, lastname) {
  let sql = `SELECT ${visibleColumns} FROM Users WHERE 1 = 1`;
  const values = [];
  if (firstname) {
    sql += ' AND firstname LIKE ?';
    values.push(`%${firstname}%`);
  }
  if (lastname) {
    sql += ' AND lastname LIKE ?';
    values.push(`%${lastname}%`);
  }
  sql += ' ORDER BY username';
  const [rows] = await pool.execute(sql, values);
  return rows;
}

async function searchByUsername(username) {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users WHERE username = ?`, [username]
  );
  return rows;
}

async function searchBySalary(min, max) {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users WHERE salary BETWEEN ? AND ? ORDER BY salary, username`,
    [min, max]
  );
  return rows;
}

async function searchByAgeRange(min, max) {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users WHERE age BETWEEN ? AND ? ORDER BY age, username`,
    [min, max]
  );
  return rows;
}

async function searchRegisteredAfter(username) {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users
     WHERE registerday > (SELECT registerday FROM Users WHERE username = ?)
     ORDER BY registerday, username`,
    [username]
  );
  return rows;
}

async function searchNeverSignedIn() {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users WHERE signintime IS NULL ORDER BY username`
  );
  return rows;
}

async function searchRegisteredSameDay(username) {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users
     WHERE registerday = (SELECT registerday FROM Users WHERE username = ?)
     ORDER BY username`,
    [username]
  );
  return rows;
}

async function searchRegisteredToday() {
  const [rows] = await pool.execute(
    `SELECT ${visibleColumns} FROM Users WHERE registerday = CURDATE() ORDER BY username`
  );
  return rows;
}

module.exports = {
  pool, registerUser, findLoginUser, recordSuccessfulSignIn,
  searchByName, searchByUsername, searchBySalary, searchByAgeRange,
  searchRegisteredAfter, searchNeverSignedIn, searchRegisteredSameDay,
  searchRegisteredToday
};
