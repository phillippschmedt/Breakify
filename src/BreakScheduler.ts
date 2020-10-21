import { settings } from "cluster"
import { Settings } from "http2"

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

export interface BreakScheduler {
    startScheduler(): void,
    stopScheduler(): void,
    restartScheduler(newSchedule? : Schedule): void,
    skipToNextBreak(): void,
    timeToNextBreak(): number,
    isRunning(): boolean
}
/**
 * Factory Method to create a BreakScheduler
 * @param  {Schedule} schedule A schedule containing at least one active break
 * @param  {Function}  startBreakCallback
 * @param  {Function}  stopBreakCallback
 * @return {BreakScheduler}  Returns a breakscheduler
 */
export function createBreakScheduler(schedule: Schedule, startBreakCallback: (duration: number) => void, stopBreakCallback: () => void, schedulerStartedCallback: () => void, schedulerStoppedCallback: () => void, autoStartNextInterval = true): BreakScheduler {

    // Makes sure schedule has at least one active break
    // Then calculates the shortestInterval
    let shortestInterval: number


    let intervalCounter: number
    let intervalTimer: NodeJS.Timeout
    let breakTimer: NodeJS.Timeout
    let intervalStartedAt: number
    let isRunning: boolean

    initialize(schedule);

    function initialize(schedule: Schedule) {
        if (schedule.shortBreak?.active) {
            shortestInterval = schedule.shortBreak.interval
        } else if (schedule.mediumBreak?.active) {
            shortestInterval = schedule.mediumBreak.interval
        } else if (schedule.longBreak?.active) {
            shortestInterval = schedule.longBreak.interval
        } else {
            throw "Error: createBreakScheduler() - Schedule has no active"
        }
        intervalCounter = shortestInterval
        isRunning = false
    }

    function runScheduler(): void {
        console.log("Next break in: " + shortestInterval)
        schedulerStartedCallback();

        // Remember when we started the current interval so we can show the time till next break.
        intervalStartedAt = Date.now()

        intervalTimer = setTimeout(() => {
            startNextBreak()
        }, shortestInterval * 1000);
    }

    function getShortBreak(): Break {
        return schedule.shortBreak
    }

    function getMediumBreak(): Break {
        return schedule.mediumBreak
    }

    function getLongBreak(): Break {
        return schedule.longBreak
    }

    function breakDone(): void {
        console.log("Break done")

        // Notify callback that the break is over
        stopBreakCallback()

        // Move to next interval
        intervalCounter += shortestInterval

        // This parameter is used when the user sets "auto start next interval when break is over"
        // TODO: We currently have this check at two places. In here and in the main.js where it makes sure the that break window doesn't close. 
        if (autoStartNextInterval) {
            runScheduler()
        } else {
            console.log("Stopping scheduler because autoStart is disabled.")
        }
    }

    function startNextBreak(): void {
        // Calculates the duration of the next break
        const duration: number = calculateNextBreak()

        console.log("Let's take a break of:" + duration)

        // Notify callback about our break
        startBreakCallback(duration)

        // Start break timer
        breakTimer = setTimeout(() => {
            breakDone()
        }, duration * 1000);

    }


    // Returns the duration of the next break
    function calculateNextBreak(): number {
        // Long Break
        let longBreak = getLongBreak()
        if (longBreak?.active && intervalCounter % longBreak.interval == 0) {
            return longBreak.duration
        }

        // Medium Break
        let mediumBreak = getMediumBreak()
        if (mediumBreak?.active && intervalCounter % mediumBreak.interval == 0) {
            return mediumBreak.duration
        }

        // Short Break
        let shortBreak = getShortBreak()
        return shortBreak.duration
    }

    // Return the BreakScheduler
    return {
        startScheduler() {
            console.log("Starting scheduler")
            isRunning = true

            runScheduler()
        },
        // TODO: Move some parts to private method, just like runScheduler()/startScheduler(9)
        stopScheduler() {
            console.log("Stopping scheduler")

            isRunning = false

            if (intervalTimer) {
                clearTimeout(intervalTimer)
                clearTimeout(breakTimer)
            }

            // Notify callbacks that we stopped the scheduler
            schedulerStoppedCallback()
        },

        skipToNextBreak() {
            console.log("Skipping to next break.")
            this.stopScheduler()
            startNextBreak()
        },

        restartScheduler(newSchedule?: Schedule) {
            // If a new schedule is submitted, we will run the scheduler with that one.
            if (newSchedule) {
                initialize(newSchedule)
            }
            console.log("Restarting scheduler")
            this.stopScheduler()
            this.startScheduler();
        },

        timeToNextBreak() {
            if (isRunning) {
                return Math.ceil((shortestInterval - (Date.now() - intervalStartedAt) / 1000))
            }
            // If it's not running the time to next break is 0
            return 0;
        },

        isRunning() {
            return isRunning
        }
    }
}

