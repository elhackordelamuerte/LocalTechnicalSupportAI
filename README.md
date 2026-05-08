# Automated IT Support Chat

A self-contained web-based IT Support chat interface powered by a local Ollama instance. Designed with a dark industrial terminal aesthetic for professional tech support operations.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Ollama](https://ollama.com/) installed and running on your local machine

## Setup

1. **Pull the AI Model**
   Open your terminal and run:
   ```bash
   ollama pull gemma4-e2b-q4
   ```

2. **Install Dependencies**
   Navigate to the project directory and run:
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Chat**
   Open your browser and visit:
   [http://localhost:3000](http://localhost:3000)

## Features

- **Local-First**: Your data never leaves your machine.
- **Streaming UI**: Responses appear in real-time as they are generated.
- **IT Support Guardrails**: The system is strictly tuned to help with technical issues.
- **Terminal Aesthetic**: High-contrast dark theme with scanline textures and monospace fonts.
