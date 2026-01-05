import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Debug logging
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Serve assets explicitly (optional safety)
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));

// Regex catch-all for Express 5 compatibility
app.get(/.*/, (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
