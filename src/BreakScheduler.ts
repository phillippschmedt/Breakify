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
        startBreakCallback: startBreakCallback,
        stopBreakCallback: stopBreakCallback,
        shortestInterval: shortestInterval,

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
            this.intervalCounter += this.shortestInterval

            // Make sure callback function is defined.
            if (this.stopBreakCallback) {
                this.stopBreakCallback()
            }

            this.runScheduler()
        },

        // private
        startNextBreak() {
            const duration: number = this.calculateNextBreak()

            console.log("Let's take a break of:" + duration)

            // Make sure callback function is defined.
            if (this.startBreakCallback) {
                this.startBreakCallback(duration)
            }
            this.breakTimer = setTimeout(() => {
                this.breakDone()

            }, duration * 1000);

        },

        // private
        calculateNextBreak(): number {
            let longBreak = this.getLongBreak()
            // Long Break
            if (longBreak?.active && this.intervalCounter % longBreak.interval == 0) {
                return longBreak.duration
            }

            let mediumBreak = this.getMediumBreak()

            // Medium Break
            if (mediumBreak?.active && this.intervalCounter % mediumBreak.interval == 0) {
                return mediumBreak.duration
            }

            let shortBreak = this.getShortBreak();

            // Short Break
            if (shortBreak?.active) {
                return shortBreak.duration
            }

            throw "Error: Invalid interval"
        },
    }
}

