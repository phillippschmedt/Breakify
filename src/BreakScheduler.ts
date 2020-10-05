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
    schedule: Schedule,
    intervalCounter: number,
    shortestInterval: number,
    intervalTimer?: NodeJS.Timeout,
    breakTimer?: NodeJS.Timeout,
    startBreakCallback: Function,
    stopBreakCallback: Function,
    startScheduler(): void,
    runScheduler(): void,
    stopScheduler(): void,
    breakDone(): void,
    skipToNextBreak(): void,
    startNextBreak(): void,
    restartScheduler(): void,
    calculateNextBreak(): number,
    getShortBreak(): Break,
    getMediumBreak(): Break,
    getLongBreak(): Break,
}
/**
 * Factory Method to create a BreakScheduler
 * @param  {Schedule} schedule A schedule containing at least one active break
 * @param  {Function}  startBreakCallback
 * @param  {Function}  stopBreakCallback
 * @return {BreakScheduler}  Returns a breakscheduler
 */
export function createBreakScheduler(schedule: Schedule, startBreakCallback: (duration: number) => void, stopBreakCallback: (duration: number) => void): BreakScheduler {

    // Makes sure schedule has at least one active break
    // Then calculates the shortestInterval
    let shortestInterval
    if (schedule.shortBreak?.active) {
        shortestInterval = schedule.shortBreak.interval
    } else if (schedule.mediumBreak?.active) {
        shortestInterval = schedule.mediumBreak.interval
    } else if (schedule.longBreak?.active) {
        shortestInterval = schedule.longBreak.interval
    } else {
        throw "Error: createBreakScheduler() - Schedule has no active"
    }

    return {
        schedule: schedule,
        intervalCounter: shortestInterval,
        shortestInterval: shortestInterval,
        startBreakCallback: startBreakCallback,
        stopBreakCallback: stopBreakCallback,

        // public
        startScheduler() {
            console.log("Starting scheduler")
            this.runScheduler()
        },

        // public
        stopScheduler() {
            console.log("Stopping scheduler")
            if (this.intervalTimer) {
                clearTimeout(this.intervalTimer)
            }
        },

        // public
        skipToNextBreak() {
            console.log("Skipping to next break.")
            this.stopScheduler()
            this.startNextBreak()
        },

        // public
        restartScheduler() {
            console.log("Restarting scheduler")
            this.stopScheduler()
            this.runScheduler()
        },

        // private
        runScheduler() {
            console.log("Next break in: " + this.shortestInterval)
            this.intervalTimer = setTimeout(() => {
                this.startNextBreak()
            }, this.shortestInterval * 1000);
        },

        // private
        getShortBreak() {
            return this.schedule.shortBreak
        },

        // private
        getMediumBreak() {
            return this.schedule.mediumBreak
        },

        // private
        getLongBreak() {
            return this.schedule.longBreak
        },

        // private
        breakDone() {
            console.log("Break done")

            // Notify callback that the break is over
            this.stopBreakCallback()

            // Move to next interval
            this.intervalCounter += this.shortestInterval

            // Start the next interval
            this.runScheduler()
        },

        // private
        startNextBreak() {
            // Calculates the duration of the next break
            const duration: number = this.calculateNextBreak()

            console.log("Let's take a break of:" + duration)

            // Notify callback about our break
            this.startBreakCallback(duration)

            // Start break timer
            this.breakTimer = setTimeout(() => {
                this.breakDone()

            }, duration * 1000);

        },

        // private
        calculateNextBreak(): number {
            // Long Break
            let longBreak = this.getLongBreak()
            if (longBreak?.active && this.intervalCounter % longBreak.interval == 0) {
                return longBreak.duration
            }

            // Medium Break
            let mediumBreak = this.getMediumBreak()
            if (mediumBreak?.active && this.intervalCounter % mediumBreak.interval == 0) {
                return mediumBreak.duration
            }

            // Short Break
            let shortBreak = this.getShortBreak()
            return shortBreak.duration


        },
    }
}

