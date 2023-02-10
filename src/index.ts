import { load } from "cheerio";
import axios from "axios";

const url: string = "https://www.citypower.co.za/customers/Pages/Load_Shedding_Downloads.aspx";

const stageTitleRegex: RegExp = /(Stage(\s)*(\s)*\d).(\s*)(Load.\s*Shedding)(\s*)(-).*(2023)/ig
const tableHeaderRegex: RegExp = /(Time)|(Blocks.\s*to.\s*be.\s*Affected)/i
const blocksExtraction: RegExp = /(Block).*.[0-9,]/i
const extractingTimeRegex: RegExp = /((\d+.(:).\d+)(\s)*.(-).\s*([0-9:].(:).\d+))/

const getFirstIndexOfStageList = (dirtySchedule: Array<string>): number => {
    for (let index in dirtySchedule) {
        if (stageTitleRegex.test(dirtySchedule[index])) return Number(index);
    }
    // If not found!!
    return -1;
}

const getLastIndexOfBlocks = (dirtySchedule: Array<string>) => {
    let pos = -1;
    for (let index in dirtySchedule) {
        if (blocksExtraction.test(dirtySchedule[index])) pos = Number(index);
    }
    // If not found!!
    return pos;
}

const getLoadSheddingSchedule = async (): Promise<Array<string> | undefined> => {
    let loadshedding: Array<string> = new Array<string>();

    try {
        const response = await axios.get(url);
        const $ = load(response.data);

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

        // console.log(loadshedding)

        return loadshedding;
    } catch (err) {
        console.error(err);
    }
};

const partitionSchedule = async (schedule: Promise<Array<string> | undefined>): Promise<Array<Array<string>> | null> => {
    const data = await schedule;
    if (!data) return null;

    const partitioned: Array<Array<string>> = [new Array<string>()]

    data.forEach((value) => {
        if (stageTitleRegex.test(value))
            partitioned.push(new Array<string>(value))
        else
            partitioned[partitioned.length - 1]?.push(value)
    })

    return partitioned;
}

const structureSchedule = async (partitioned: Promise<Array<Array<string>> | null>) => {
    const data = await partitioned;
    if (!data) return null;

    let time: string | null = String();
    let dateMatch: RegExpMatchArray | null = null;
    let stage: RegExpMatchArray | null = null;
    let completeSchedule: Array<{
        stage?: string | null
        date?: string,
        time?: string,
        blocks?: string
    }> = [new Object];

    for (let schedule of data) {
        for (let stageInfo of schedule) {
            if (stageTitleRegex.test(stageInfo)) {
                dateMatch = stageInfo.match(/\d+(st|nd|rd|th).*.(2023)/i);
                stage = stageInfo.match(/(Stage\s*).\d+/)
            }
            else if (blocksExtraction.test(stageInfo)) {
                if (extractingTimeRegex.test(time)) {
                    if (dateMatch && stage) {
                        let tm = time.match(extractingTimeRegex)

                        completeSchedule.push({
                            date: dateMatch[0].trim(),
                            stage: stage[0],
                            blocks: stageInfo,
                            time: tm ? tm[0] : undefined
                        })
                    }
                    time = ''
                }
            }
            else {
                if (!extractingTimeRegex.test(stageInfo)) time += stageInfo
                else time = stageInfo
            }
        }
    }

    // console.log(completeSchedule)
    return completeSchedule;
}

const todaySchedule = async (block: number): Promise<string | Array<Object>> => {
    const data = await structureSchedule(partitionSchedule(getLoadSheddingSchedule()));;
    const date: Date = new Date();
    const today: Array<Object> = new Array<Object>();

    if (!data) return String("Error occured while fetching data...");

    for (let s of data) {
        const day = s.date?.match(/^\d+/)

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

export { todaySchedule }
