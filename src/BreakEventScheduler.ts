import { EventEmitter } from 'events'
import EventScheduler from "./EventScheduler"

export interface Break {
    interval: number,
    duration: number,
    active: boolean,
}

export interface Schedule {
    shortBreak: Break,
    mediumBreak: Break,
    longBreak: Break,
}
class BreakEventScheduler extends EventEmitter {
    schedule: Schedule
    eventScheduler: EventScheduler | null
    shortestInterval: number
    isRunning: boolean
    intervalCounter: number

    // The breakscheduler expects a properly constructed schedule to be initialized.
    // TODO: Write test for invalid schedules
    constructor(schedule: Schedule) {
        super()

        this.schedule = schedule
        this.eventScheduler = null

        // Makes sure we have at least one active break and sets the shortest interval.
        if (schedule.shortBreak?.active) {
            this.shortestInterval = schedule.shortBreak.interval
        } else if (schedule.mediumBreak?.active) {
            this.shortestInterval = schedule.mediumBreak.interval
        } else if (schedule.longBreak?.active) {
            this.shortestInterval = schedule.longBreak.interval
        } else {
            throw "Error: Invalid schedule passed to BreakScheduler"
        }

        this.intervalCounter = this.shortestInterval
        this.isRunning = false

        this.on('breakStart', (breakDuration) => {
            console.log("break started")
            this.eventScheduler?.cancel()
            this.eventScheduler = new EventScheduler(() => { this.emit('breakEnded') }, breakDuration)
            this.eventScheduler.start();
        })

        this.on('breakEnded', (breakDuration) => {
            console.log("breakEnded")
            this.eventScheduler?.cancel()
        })
    }

    // Returns the duration of the next break
    private calculateNextBreak(): number {
        // Long Break
        let longBreak = this.schedule.longBreak
        if (longBreak?.active && this.intervalCounter % longBreak.interval == 0) {
            return longBreak.duration
        }

        // Medium Break
        let mediumBreak = this.schedule.mediumBreak
        if (mediumBreak?.active && this.intervalCounter % mediumBreak.interval == 0) {
            return mediumBreak.duration
        }

        // Short Break
        let shortBreak = this.schedule.shortBreak
        return shortBreak.duration
    }

    // Schedule the next interval
    next() {
        console.log("Scheduling next break")
        let nextBreakDuration = this.calculateNextBreak()
        this.eventScheduler = new EventScheduler(() => { this.emit('breakStart', nextBreakDuration) }, this.shortestInterval)
        this.eventScheduler.start();
    }
}

let settings = {
    "schedule": {
        "shortBreak": {
            "interval": 5,
            "duration": 5,
            "active": true
        },
        "mediumBreak": {
            "interval": 10,
            "duration": 10,
            "active": true
        },
        "longBreak": {
            "interval": 45,
            "duration": 5,
            "active": false
        }
    },
    "autoFinishBreak": false,
    "fullScreenBreaks": true
}

let scheduler = new BreakEventScheduler(settings.schedule);
scheduler.next();

export default BreakEventScheduler