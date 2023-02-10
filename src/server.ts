import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import schedule from "./index"

const PORT = process.env.PORT || 3000;
const app: Application = express();
const server = createServer(app);

const todaySchedule = async (block: number): Promise<string | Array<Object>> => {
    const data = await schedule;
    const date: Date = new Date();
    const today: Array<Object> = new Array<Object>();

    if (!data) return String("Error occured while fetching data...");

    for (let s of data) {
        const day = s.date?.match(/^\d/)

        if (day) {
            if (date.getDate() === Number(day[0])) {
                const hours = s.time?.match(/^\d+/)
                if (hours) {
                    if (Number(hours[0]) >= date.getHours()) {
                        const splitBlocks = s.blocks?.split(',')

                        if (!splitBlocks) return [];

                        for (let b of splitBlocks) {
                            const ckb = b.match(/(\d+)/)
                            if (ckb) {
                                if (+ckb[0] === block)
                                    today.push(s)
                            }
                        }
                    }
                }
            }
        }
    }
    return today.length > 0 ? today : String("<h1>You do not have any more loadshedding today</h1>")
}

app.use(cors());
app.use(express.json());
todaySchedule(16);
app.get('/', async (_, res) => {
    const nextLoadshedding = await todaySchedule(16);
    res.send(typeof nextLoadshedding === 'string' ? nextLoadshedding : nextLoadshedding[0])
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));