interface IntervalBreak {
    interval: number,
    duration: number,
    active: boolean,
}

interface BreakScheduler {
    shortBreak: IntervalBreak,
    mediumBreak: IntervalBreak,
    longBreak: IntervalBreak,
    shortestInterval: number,
    intervalCounter: number,
    intervalTimer: NodeJS.Timeout,
    breakTimer: NodeJS.Timeout,
    startBreakFunction(duration : number) : void,
    stopBreakFunction() : void,
    startScheduler(): void,
    runScheduler(): void,
    stopScheduler(): void,
    breakDone(): void,
    skipToNextBreak(): void,
    startNextBreak(): void,
    restartScheduler(): void,
    calculateNextBreak(): void,
}

const breakScheduler: BreakScheduler = {
    intervalCounter: 0,
    shortBreak: { interval: 5, duration: 300, active: true },
    mediumBreak: { interval: 15, duration: 4, active: true },
    longBreak: { interval: 45, duration: 5, active: true },
    shortestInterval: 0,
    intervalTimer: null,
    breakTimer: null,
    startBreakFunction: null,
    stopBreakFunction: null,

    // public
    startScheduler() {
        console.log("Starting the scheduler")

        // Initialize the intervalCounter with the smallest active interval
        if (this.shortBreak.active) {
            this.intervalCounter = this.shortBreak.interval
        } else if (this.mediumBreak.active) {
            this.intervalCounter = this.mediumBreak.interval
        } else if (this.longBreak.active) {
            this.intervalCounter = this.longBreak.interval
        }

        this.runScheduler()
    },

    // public
    stopScheduler() {
        clearTimeout(this.intervalTimer)
    },

    // public
    skipToNextBreak() {
        console.log("Let's skip to the next break.")
        this.stopScheduler()
        this.startNextBreak()
    },

    // public
    restartScheduler() {
        console.log("Restarting scheduler")
        this.stopScheduler()
        this.startScheduler()
    },

    // private
    runScheduler() {
        // Check if we have atleast one active break. 
        if (!this.shortBreak.active && !this.mediumBreak.active && !this.longBreak.active) {
            console.log("Can't run scheduler. No active breaks.")
            return
        }

        // We run a break at least every smallest interval.
        if (this.shortBreak.active) {
            this.shortestInterval = this.shortBreak.interval
        } else if (this.mediumBreak.active) {
            this.shortestInterval = this.mediumBreak.interval
        } else if (this.longBreak.active) {
            this.shortestInterval = this.longBreak.interval
        }

        console.log("Next break in: " + this.shortestInterval)
        this.intervalTimer = setTimeout(() => {
            this.startNextBreak()
        }, this.shortestInterval * 1000);
    },

    // private
    breakDone() {
        console.log("Break done")
        this.intervalCounter += this.shortestInterval
        this.stopBreakFunction()
        this.runScheduler()
    },

    // private
    startNextBreak() {
        const duration = this.calculateNextBreak()

        console.log("Let's take a break of:" + duration)
        this.startBreakFunction(duration)
        this.breakTimer = setTimeout(() => {
            this.breakDone()

        }, duration * 1000);

    },

    // private
    calculateNextBreak() {
        // Long Break
        if (this.longBreak.active && this.intervalCounter % this.longBreak.interval == 0) {
            return this.longBreak.duration
        }

        // Medium Break
        if (this.mediumBreak.active && this.intervalCounter % this.mediumBreak.interval == 0) {
            return this.mediumBreak.duration
        }

        // Short Break
        if (this.shortBreak.active) {
            return this.shortBreak.duration
        }

        // Things went wrong if we reach this point.
        console.log("Invalid interval")
        return
    },
}

export default breakScheduler

