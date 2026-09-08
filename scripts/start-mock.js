// Arranca el servidor forzando respuestas simuladas (sin Ollama).
// Equivale a `MOCK_LLM=true node src/index.js` pero funciona igual en
// Windows / PowerShell / bash sin depender de cross-env.
process.env.MOCK_LLM = 'true';
require('../src/index.js');
