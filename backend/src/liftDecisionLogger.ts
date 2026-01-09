import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "lift_decisions.txt");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

export function logLiftDecision(data: {
    floorClicks: Record<number, number>;
    decidedStops: number[];
}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        floorClicks: data.floorClicks,
        decidedStops: data.decidedStops,
    };

    fs.appendFileSync(
        LOG_FILE,
        JSON.stringify(logEntry) + "\n",
        "utf-8"
    );
}
