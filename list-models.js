require("dotenv").config();

// ✅ Import node-fetch correctly for CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function listModels() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("Error listing models:", data.error);
      return;
    }

    console.log("Available models:");
    data.models.forEach((m) => {
      console.log(m.name);
    });

  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

listModels();