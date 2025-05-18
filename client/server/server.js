const express = require('express');
const cors = require('cors');
const { getDiseaseInfo } = require('./diseaseInfo');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/get-disease-info', async (req, res) => {
  const { disease } = req.body;
  if (!disease) return res.status(400).json({ error: 'Disease name is required' });

  try {
    const info = await getDiseaseInfo(disease);
    res.json({ info });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch disease info' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
