require('dotenv').config();
const express = require('express');
const { NeynarAPIClient, Configuration } = require('@neynar/nodejs-sdk');
const app = express();

const config = new Configuration({ apiKey: process.env.NEYNAR_API_KEY });
const client = new NeynarAPIClient(config);

app.use(express.static('public'));

app.get('/api/user/:fid', async (req, res) => {
  try {
    const fid = parseInt(req.params.fid);
    const { users } = await client.fetchBulkUsers([fid]);
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.listen(process.env.PORT, () => console.log(Server running on port ${process.env.PORT}));
