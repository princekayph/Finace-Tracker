const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT||5000;

app.use(cors());
app.use(express.json());

//Ai advice route
app.post("/api/advice", async(req, res) => {
    const transactions = req.body.transactions;

    try{
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages:[
                    {
                    role: "system",
                    content: "You are a helpful financial advisor. Analyze the user's recent transactions and give practical advice for improving finances.",
                    },
                    {
                        role: "user",
                        content: `Here are the user's recent transactions:\n\${JSON.stringify(transactions, null, 2)}\n\nPlease provide advice.`,
                    },
                ],
            },
            {
                headers:{
                   "Content-Type" : "application/json",
                   Authorization : `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        res.json({advice: response.data.choices[0].message.content});
    } catch (err) {
        console.error("Error fetching advice:", err.message);
        res.status(500).json({error: "Failed to get advice"});
    
    }
});

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});