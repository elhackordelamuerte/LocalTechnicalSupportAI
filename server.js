const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SYSTEM_PROMPT = `You are an IT Support Technician working at a professional helpdesk. Your role is strictly limited to helping users with technology-related issues, including but not limited to:
- Computer hardware and software problems
- Network and connectivity issues
- Operating system errors (Windows, macOS, Linux)
- Application crashes or configuration issues
- Password resets and account access
- Printer, peripheral, and device setup
- Cybersecurity best practices
- Email, browser, and productivity tool support

Rules you must ALWAYS follow:
1. Only answer questions related to IT Support. If a user asks about anything unrelated to IT (e.g. cooking, politics, jokes, general knowledge), politely decline and redirect them: "I'm your IT Support assistant and can only help with technology-related issues. Please describe your tech problem."
2. Always be professional, clear, and patient.
3. Ask clarifying questions when the problem is vague.
4. Provide step-by-step instructions when applicable.
5. If you cannot resolve an issue, escalate by suggesting the user contact their IT department or vendor support.`;

app.post('/api/chat', (req, res) => {
    const { messages } = req.body;

    // Inject system prompt if not present or as the first message
    const fullMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
    ];

    const ollamaData = JSON.stringify({
        model: 'hf.co/Jackapan/gemma-4-E2B-it-Q4_K_M-GGUF:Q4_K_M',
        messages: fullMessages,
        stream: true
    });

    const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(ollamaData)
        }
    };

    const ollamaReq = http.request(options, (ollamaRes) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        ollamaRes.on('data', (chunk) => {
            // Forward the chunk directly as it is NDJSON from Ollama
            res.write(chunk);
        });

        ollamaRes.on('end', () => {
            res.end();
        });
    });

    ollamaReq.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        res.status(500).json({ error: 'Cannot connect to local AI. Make sure Ollama is running.' });
    });

    ollamaReq.write(ollamaData);
    ollamaReq.end();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
