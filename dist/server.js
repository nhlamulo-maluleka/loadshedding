"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const index_1 = require("./index");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`<h1>WELCOME TO YOUR LOADSHEDDING ALERT SYSTEM</h1>`);
}));
app.get('/next/:block', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const block = req.params.block;
    const nextLoadshedding = yield (0, index_1.todaySchedule)(+block);
    res.send(typeof nextLoadshedding === 'string' ? nextLoadshedding : nextLoadshedding[0]);
}));
app.get('/all/:block', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const block = req.params.block;
    const nextLoadshedding = yield (0, index_1.todaySchedule)(+block);
    res.send(typeof nextLoadshedding === 'string' ? nextLoadshedding : nextLoadshedding);
}));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
