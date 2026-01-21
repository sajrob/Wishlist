import express from 'express';
import cors from 'cors';
import scrapeRouter from './server/routes/scrape.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', scrapeRouter);

app.listen(port, () => {
    console.log(`✓ Scraper API: http://localhost:${port}`);
    console.log(`✓ Endpoints:`);
    console.log(`  - GET /api/scrape?url=...`);
});
