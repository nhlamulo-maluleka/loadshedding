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
const index_1 = __importDefault(require("./index"));
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const todaySchedule = (block) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const data = yield index_1.default;
    const date = new Date();
    const today = new Array();
    if (!data)
        return String("Error occured while fetching data...");
    for (let s of data) {
        const day = (_a = s.date) === null || _a === void 0 ? void 0 : _a.match(/^\d/);
        if (day) {
            if (date.getDate() === Number(day[0])) {
                const hours = (_b = s.time) === null || _b === void 0 ? void 0 : _b.match(/^\d+/);
                if (hours) {
                    if (Number(hours[0]) >= date.getHours()) {
                        const splitBlocks = (_c = s.blocks) === null || _c === void 0 ? void 0 : _c.split(',');
                        if (!splitBlocks)
                            return [];
                        for (let b of splitBlocks) {
                            const ckb = b.match(/(\d+)/);
                            if (ckb) {
                                if (+ckb[0] === block)
                                    today.push(s);
                            }
                        }
                    }
                }
            }
        }
    }
    return today.length > 0 ? today : String("<h1>You do not have any more loadshedding today</h1>");
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
todaySchedule(16);
app.get('/', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nextLoadshedding = yield todaySchedule(16);
    res.send(typeof nextLoadshedding === 'string' ? nextLoadshedding : nextLoadshedding[0]);
}));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
