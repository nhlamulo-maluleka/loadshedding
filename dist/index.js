"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const url = "https://www.citypower.co.za/customers/Pages/Load_Shedding_Downloads.aspx";
const stageTitleRegex = /(Stage(\s)*(\s)*\d).(\s*)(Load.\s*Shedding)(\s*)(-).*(2023)/ig;
const tableHeaderRegex = /(Time)|(Blocks.\s*to.\s*be.\s*Affected)/i;
const blocksExtraction = /(Block).*.[0-9,]/i;
const extractingTimeRegex = /((\d.(:).\d)(\s)*.(-).\s*([0-9:].(:).\d))/;
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
const getLoadSheddingSchedule = async () => {
    let loadshedding = new Array();
    try {
        const response = await axios_1.default.get(url);
        const $ = (0, cheerio_1.load)(response.data);
        const headers = $("span");
        headers.each(function (i, _) {
            loadshedding[i] = $(this).text();
        });
        // Removing empty indexes
        loadshedding = await loadshedding.filter((value) => /[A-Za-z0-9]/g.test(value));
        // Removing table headers (Time && Blocks to be Affected)
        loadshedding = await loadshedding.filter((value) => !tableHeaderRegex.test(value));
        await loadshedding.splice(0, getFirstIndexOfStageList(loadshedding));
        await loadshedding.splice(getLastIndexOfBlocks(loadshedding) + 1, loadshedding.length);
        return loadshedding;
    }
    catch (err) {
        console.error(err);
    }
};
const partitionSchedule = async (schedule) => {
    const data = await schedule;
    if (!data)
        return null;
    const partitioned = [new Array()];
    data.forEach((value) => {
        if (stageTitleRegex.test(value))
            partitioned.push(new Array(value));
        else
            partitioned[partitioned.length - 1]?.push(value);
    });
    return partitioned;
};
const structureSchedule = async (partitioned) => {
    const data = await partitioned;
    if (!data)
        return null;
    let time = String();
    let dateMatch = null;
    let stage = null;
    let completeSchedule = [new Object];
    for (let schedule of data) {
        for (let stageInfo of schedule) {
            if (stageTitleRegex.test(stageInfo)) {
                dateMatch = stageInfo.match(/\d(st|nd|rd|th).*.(2023)/i);
                stage = stageInfo.match(/(Stage\s*).\d/);
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
    return completeSchedule;
};
exports.default = structureSchedule(partitionSchedule(getLoadSheddingSchedule()));
