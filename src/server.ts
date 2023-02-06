import express from "express";
import { createServer } from "http";
import cors from "cors";
import schedule from "./index"

const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);

const todaySchedule = async (block: number): Promise<string | Array<Object>> => {
    const data = await schedule;
    const date: Date = new Date();
    const today: Array<Object> = new Array<Object>();

    if (!data) return String("Error occured while fetching data...");

    for (let s of data) {
        const day = s.date?.match(/^\d/)
        if (day) {
            if (date.getDate() === Number(day)) {
                const hours = s.time?.match(/^\d/)
                if (hours) {
                    if (Number(hours[0]) === date.getHours()) {
                        const startTime = s.time?.split("-");
                        if (startTime) console.log(`${startTime[0].trim()}:00`)
                    }
                }
            }
        }
    }
    return today.length > 0 ? today : String("<h1>You do not have loadshedding today</h1>")
}

app.use(cors());
app.use(express.json());

app.get('/', async (_, res) => {
    res.send(await todaySchedule(16));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));