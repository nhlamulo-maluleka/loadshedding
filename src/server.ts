import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import { todaySchedule } from "./index"

const PORT = process.env.PORT || 3000;
const app: Application = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.get('/', async (_, res) => {
    res.send(`<h1>WELCOME TO YOUR LOADSHEDDING ALERT SYSTEM</h1>`)
});

app.get('/next/:block', async (req, res) => {
    const block = req.params.block;
    const nextLoadshedding = await todaySchedule(+block);
    res.send(typeof nextLoadshedding === 'string' ? nextLoadshedding : nextLoadshedding[0])
});

app.get('/all/:block', async (req, res) => {
    const block = req.params.block;
    const nextLoadshedding = await todaySchedule(+block);
    res.send(typeof nextLoadshedding === 'string' ? nextLoadshedding : nextLoadshedding)
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));