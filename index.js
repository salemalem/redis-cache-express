const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();

const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const TTL = {
  'Buildings': 3600,
  'Checklists': 7200,
  'Members': 3600,
  'Config': 86400
};

function fetchFromApi(topic, projectId) {
  switch (topic) {
    case 'Buildings':
      return axios.get(`/v1/structure?projectId=${projectId}&locationType=building`);
    case 'Checklists':
      return axios.get(`/v2/Checklists?projectId=${projectId}`);
    case 'Members':
      return axios.get(`/v1/project/${projectId}?fields=["members"]`);
    case 'Config':
      return axios.get(`/v1/configurations?projectId=${projectId}`);
    default:
      throw new Error('Invalid topic');
  }
}

app.get('/cache/:topic/:projectId', async (req, res) => {
  const { topic, projectId } = req.params;
  const key = `${topic}-${projectId}`;

  client.get(key, async (err, cachedData) => {
    if (err) throw err;

    if (cachedData) {
      return res.json({ source: 'cache', data: JSON.parse(cachedData) });
    } else {
      try {
        const response = await fetchFromApi(topic, projectId);
        client.setex(key, TTL[topic], JSON.stringify(response.data));
        res.json({ source: 'API', data: response.data });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
