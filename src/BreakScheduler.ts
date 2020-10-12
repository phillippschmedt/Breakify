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
    restartScheduler(): void,
    skipToNextBreak(): void,
    timeToNextBreak(): number,
    isIntervalRunning(): boolean
}
/**
 * Factory Method to create a BreakScheduler
 * @param  {Schedule} schedule A schedule containing at least one active break
 * @param  {Function}  startBreakCallback
 * @param  {Function}  stopBreakCallback
 * @return {BreakScheduler}  Returns a breakscheduler
 */
export function createBreakScheduler(schedule: Schedule, startBreakCallback: (duration: number) => void, stopBreakCallback: () => void, autoStartNextInterval = true): BreakScheduler {

    // Makes sure schedule has at least one active break
    // Then calculates the shortestInterval
    let shortestInterval: number

    if (schedule.shortBreak?.active) {
        shortestInterval = schedule.shortBreak.interval
    } else if (schedule.mediumBreak?.active) {
        shortestInterval = schedule.mediumBreak.interval
    } else if (schedule.longBreak?.active) {
        shortestInterval = schedule.longBreak.interval
    } else {
        throw "Error: createBreakScheduler() - Schedule has no active"
    }

    let intervalCounter: number = shortestInterval
    let intervalTimer: NodeJS.Timeout
    let breakTimer: NodeJS.Timeout
    let invertalStatedAt: number
    let isIntervalRunning: boolean = false

    function runScheduler(): void {
        console.log("Next break in: " + shortestInterval)

        isIntervalRunning = true;

        // Remember when we started the current interval so we can show the time till next break.
        invertalStatedAt = Date.now()

        intervalTimer = setTimeout(() => {
            isIntervalRunning = false
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

        // Start the next interval
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
            runScheduler()
        },

        stopScheduler() {
            console.log("Stopping scheduler")

            isIntervalRunning = false

            if (intervalTimer) {
                clearTimeout(intervalTimer)
                clearTimeout(breakTimer)
            }
        },

        skipToNextBreak() {
            console.log("Skipping to next break.")
            this.stopScheduler()
            startNextBreak()
        },

        restartScheduler() {
            console.log("Restarting scheduler")
            this.stopScheduler()
            runScheduler()
        },

        timeToNextBreak() {
            if (isIntervalRunning) {
                return Math.ceil((shortestInterval - (Date.now() - invertalStatedAt) / 1000))
            }

            // If it's not running the time to next break is 0
            return 0;
        },

        isIntervalRunning() {
            return isIntervalRunning
        }
    }
}

