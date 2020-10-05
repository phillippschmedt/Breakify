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
}
/**
 * Factory Method to create a BreakScheduler
 * @param  {Schedule} schedule A schedule containing at least one active break
 * @param  {Function}  startBreakCallback
 * @param  {Function}  stopBreakCallback
 * @return {BreakScheduler}  Returns a breakscheduler
 */
export function createBreakScheduler(schedule: Schedule, startBreakCallback: (duration: number) => void, stopBreakCallback: () => void): BreakScheduler {

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

    let intervalCounter = shortestInterval
    let _intervalTimer: NodeJS.Timeout
    let _breakTimer: NodeJS.Timeout

    function runScheduler() {
        console.log("Next break in: " + shortestInterval)
        _intervalTimer = setTimeout(() => {
            startNextBreak()
        }, shortestInterval * 1000);
    }

    function getShortBreak() {
        return schedule.shortBreak
    }

    function getMediumBreak() {
        return schedule.mediumBreak
    }

    function getLongBreak() {
        return schedule.longBreak
    }

    function breakDone() {
        console.log("Break done")

        // Notify callback that the break is over
        stopBreakCallback()

        // Move to next interval
        intervalCounter += shortestInterval

        // Start the next interval
        runScheduler()
    }

    function startNextBreak() {
        // Calculates the duration of the next break
        const duration: number = calculateNextBreak()

        console.log("Let's take a break of:" + duration)

        // Notify callback about our break
        startBreakCallback(duration)

        // Start break timer
        _breakTimer = setTimeout(() => {
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
            if (_intervalTimer) {
                clearTimeout(_intervalTimer)
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
    }
}

