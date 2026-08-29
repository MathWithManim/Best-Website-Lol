// Serverless entry: connects to Neon via DATABASE_URL env
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
exports.handler = async (req, res) => {
  const r = await pool.query("SELECT 1");
  res.status(200).json({ db: "neon", ok: true });
};
