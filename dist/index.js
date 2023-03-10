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
exports.todaySchedule = void 0;
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const url = "https://www.citypower.co.za/customers/Pages/Load_Shedding_Downloads.aspx";
const stageTitleRegex = /(Stage(\s)*(\s)*\d).(\s*)(Load.\s*Shedding)(\s*)(-).*(2023)/ig;
const tableHeaderRegex = /(Time)|(Blocks.\s*to.\s*be.\s*Affected)/i;
const blocksExtraction = /(Block).*.[0-9,]/i;
const extractingTimeRegex = /((\d+.(:).\d+)(\s)*.(-).\s*([0-9:].(:).\d+))/;
const getFirstIndexOfStageList = (dirtySchedule) => {
    for (let index in dirtySchedule) {
        if (stageTitleRegex.test(dirtySchedule[index]))
            return Number(index);
    }
    // If not found!!
    return -1;
};
const getLastIndexOfBlocks = (dirtySchedule) => {
    let pos = -1;
    for (let index in dirtySchedule) {
        if (blocksExtraction.test(dirtySchedule[index]))
            pos = Number(index);
    }
    // If not found!!
    return pos;
};
const getLoadSheddingSchedule = () => __awaiter(void 0, void 0, void 0, function* () {
    let loadshedding = new Array();
    try {
        const response = yield axios_1.default.get(url);
        const $ = (0, cheerio_1.load)(response.data);
        const headers = $("span");
        headers.each(function (i, _) {
            loadshedding[i] = $(this).text();
        });
        // Removing empty indexes
        loadshedding = yield loadshedding.filter((value) => /[A-Za-z0-9]/g.test(value));
        // Removing table headers (Time && Blocks to be Affected)
        loadshedding = yield loadshedding.filter((value) => !tableHeaderRegex.test(value));
        yield loadshedding.splice(0, getFirstIndexOfStageList(loadshedding));
        yield loadshedding.splice(getLastIndexOfBlocks(loadshedding) + 1, loadshedding.length);
        // console.log(loadshedding)
        return loadshedding;
    }
    catch (err) {
        console.error(err);
    }
});
const partitionSchedule = (schedule) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield schedule;
    if (!data)
        return null;
    const partitioned = [new Array()];
    data.forEach((value) => {
        var _a;
        if (stageTitleRegex.test(value))
            partitioned.push(new Array(value));
        else
            (_a = partitioned[partitioned.length - 1]) === null || _a === void 0 ? void 0 : _a.push(value);
    });
    return partitioned;
});
const structureSchedule = (partitioned) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield partitioned;
    if (!data)
        return null;
    let time = String();
    let dateMatch = null;
    let stage = null;
    let completeSchedule = [new Object];
    for (let schedule of data) {
        for (let stageInfo of schedule) {
            if (stageTitleRegex.test(stageInfo)) {
                dateMatch = stageInfo.match(/\d+(st|nd|rd|th).*.(2023)/i);
                stage = stageInfo.match(/(Stage\s*).\d+/);
            }
            else if (blocksExtraction.test(stageInfo)) {
                if (extractingTimeRegex.test(time)) {
                    if (dateMatch && stage) {
                        let tm = time.match(extractingTimeRegex);
                        completeSchedule.push({
                            date: dateMatch[0].trim(),
                            stage: stage[0],
                            blocks: stageInfo,
                            time: tm ? tm[0] : undefined
                        });
                    }
                    time = '';
                }
            }
            else {
                if (!extractingTimeRegex.test(stageInfo))
                    time += stageInfo;
                else
                    time = stageInfo;
            }
        }
    }
    // console.log(completeSchedule)
    return completeSchedule;
});
const todaySchedule = (block) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const data = yield structureSchedule(partitionSchedule(getLoadSheddingSchedule()));
    ;
    const date = new Date();
    const today = new Array();
    if (!data)
        return String("Error occured while fetching data...");
    for (let s of data) {
        const day = (_a = s.date) === null || _a === void 0 ? void 0 : _a.match(/^\d+/);
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
exports.todaySchedule = todaySchedule;
