import * as fs from 'fs';
import * as path from "path";
import { Schedule } from './BreakScheduler';

export interface AppSettings {
    schedule: Schedule,
    autoFinishBreak: boolean
}

export function loadSettings(): AppSettings | undefined {
    // Read raw config content
    let rawContent
    try {
        rawContent = fs.readFileSync(path.join(__dirname, '../settings.json'));
    } catch (error) {
        console.log("Error opening config file.: " + error)
        return
    }

    // Parse config content to JSON
    let parsedContent
    try {
        parsedContent = JSON.parse(rawContent.toString());
    } catch (error) {
        console.log("Error parsing config file")
        return
    }
    return parsedContent
}

export function storeSettings(settings: AppSettings): void {
    let settingsRaw = JSON.stringify(settings, null, 2);
    
    try {
        fs.writeFileSync(path.join(__dirname, '../settings.json'), settingsRaw);
    } catch (error) {
        console.log("Error writing config file")
    }
}
