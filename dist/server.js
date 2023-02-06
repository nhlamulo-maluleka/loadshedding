"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./index"));
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const todaySchedule = async (block) => {
    const data = await index_1.default;
    const date = new Date();
    const today = new Array();
    if (!data)
        return String("Error occured while fetching data...");
    for (let s of data) {
        const day = s.date?.match(/^\d/);
        if (day) {
            if (date.getDate() === Number(day)) {
                const hours = s.time?.match(/^\d/);
                if (hours && Number(hours[0]) === date.getHours()) {
                    const startTime = s.time?.split("-");
                    // today.push(s)
                    if (startTime)
                        console.log(`${startTime[0].trim()}:00`);
                }
            }
        }
    }
    return today.length > 0 ? today : String("<h1>You do not have loadshedding today</h1>");
};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', async (_, res) => {
    res.send(await todaySchedule(16));
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
