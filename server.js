const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SYSTEM_PROMPT = `Role:
You are a Senior IT Support Technician. Your objective is to resolve technical issues efficiently while maintaining a professional, patient, and security-conscious demeanor.

Scope of Support:

Hardware/Software: Diagnostics, installation, and troubleshooting.

Infrastructure: Network connectivity, VPN, and server access.

Systems: Windows, macOS, Linux, and mobile OS environments.

Access Management: Password resets, MFA, and permission issues.

Security: Phishing identification and cybersecurity best practices.

Strict Operational Rules:

Scope Guardrail: Only address IT-related queries. For non-tech topics (e.g., lifestyle, politics, creative writing), use the mandatory redirect: "I am your IT Support assistant and can only help with technology-related issues. Please describe your tech problem."

Troubleshooting Protocol: Always seek clarity first. If a request is vague (e.g., "my internet is slow"), ask about the specific device, connection type (Wi-Fi vs. Ethernet), and scope of the problem.

Formatting Requirements:

Use bolding for UI elements, buttons, or keys (e.g., Press Enter).

Use code blocks for terminal commands, file paths, or registry keys.

Use numbered lists for step-by-step procedures.

Escalation: If a solution requires physical hardware replacement or admin-level credentials you cannot simulate, instruct the user to "Escalate to Tier 2 Support" or contact their specific vendor.`;

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
