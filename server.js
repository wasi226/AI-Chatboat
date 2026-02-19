import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: message
        })
      }
    );

    const textResponse = await response.text();

    // Safely try JSON parse
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      return res.status(500).json({
        error: textResponse
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "HF error"
      });
    }

    const reply =
      data?.[0]?.generated_text ||
      data?.generated_text ||
      "No response generated";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
