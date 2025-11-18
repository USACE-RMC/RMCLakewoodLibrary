require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/create-issue', async (req, res) => {
  const token = process.env.YOUR_GITHUB_TOKEN; // Securely access the token
  const data = req.body;

  try {
    const response = await fetch("https://api.github.com/repos/your-repo/issues", {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      return res.status(response.status).send({ error: response.statusText });
    }

    const result = await response.json();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to create issue" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));