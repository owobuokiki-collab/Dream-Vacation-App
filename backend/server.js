const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
app.get('/api/destinations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET ERROR:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/destinations', async (req, res) => {
  const { country } = req.body;
  try {
    const infoRes = await axios.get(
      'https://countriesnow.space/api/v0.1/countries/info?returns=capital,region'
    );
    const countryData = infoRes.data.data.find(
      (c) => c.name.toLowerCase() === country.toLowerCase()
    );
    if (!countryData) {
      return res.status(404).json({ error: "Country not found" });
    }
    const popRes = await axios.post(
      'https://countriesnow.space/api/v0.1/countries/population',
      { country: countryData.name }
    );
    const popCounts = popRes.data.data?.populationCounts || [];
    const latestPop = popCounts.length > 0 ? popCounts[popCounts.length - 1].value : 0;
    const result = await pool.query(
      `INSERT INTO destinations (country, capital, population, region)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [countryData.name, countryData.capital || "Unknown", latestPop, countryData.region || "Unknown"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch country data. Try a valid country name." });
  }
});
app.delete('/api/destinations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM destinations WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
