# BU_chAtbot

## Gemini setup & quick testing

If you want the backend to use Google Gemini (your API Studio key), set the following in `backend/.env`:

- `GEMINI_API_KEY` — your API Studio key (already used in this project)
- `GEMINI_MODEL` — the model id that works for your key (e.g. `gemini-2.5-flash`). Use the included `detect_gemini_models.js` script to probe which model IDs are callable.
- `RAG_MODE` — controls retrieval/LLM behavior:
	- `kb-only` — only return knowledge base answers
	- `refine` — (default) use KB when available, otherwise ask the model
	- `llm-only` — always call the LLM

Quick test endpoint
- Start the backend and then call:

	GET /test/llm?q=Tell%20me%20a%20joke

	This endpoint temporarily forces an LLM-only call and returns the model's generated text.

How to run locally (PowerShell):

```powershell
cd C:\Users\loyalty\Desktop\BU_chAtbot\backend
# stop any running node servers
taskkill /F /IM node.exe 2>$null; Start-Sleep -Seconds 1
node server.js

# Test LLM endpoint
$body = @{ q = "Tell me a joke" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/chat' -Body $body -ContentType 'application/json'
Invoke-RestMethod -Method Get -Uri 'http://localhost:8000/test/llm?q=Tell%20me%20a%20joke'
```


