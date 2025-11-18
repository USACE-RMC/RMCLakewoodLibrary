require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json()); // Parse JSON request bodies

// Endpoint to create GitHub issues
app.post('/create-issue', async (req, res) => {
  const { barcode, user, action } = req.body; // Extract data from request body

  const token = process.env.GITHUB_TOKEN; // Access the token securely
  const data = { barcode, user, action };

  try {
    const response = await fetch("https://api.github.com/repos/your-repo/issues", {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        title: `Book ${action}: ${barcode}`,
        body: JSON.stringify(data)
      })
    });

    if (!response.ok) {
      return res.status(response.status).send({ error: response.statusText });
    }

    const result = await response.json();
    res.send(result); // Send the GitHub API response back to the client
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).send({ error: "Failed to create issue" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});