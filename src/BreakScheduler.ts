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

interface BreakScheduler {
    schedule: Schedule | null,
    shortestInterval: number,
    intervalCounter: number,
    intervalTimer: NodeJS.Timeout | null,
    breakTimer: NodeJS.Timeout | null,
    startBreakFunction: Function | null,
    stopBreakFunction: Function | null,
    startScheduler(schedule: Schedule): void,
    runScheduler(): void,
    stopScheduler(): void,
    breakDone(): void,
    skipToNextBreak(): void,
    startNextBreak(): void,
    restartScheduler(): void,
    calculateNextBreak(): number,
    getShortBreak(): Break | null,
    getMediumBreak(): Break | null,
    getLongBreak(): Break | null,
}


const breakScheduler: BreakScheduler = {
    intervalCounter: 0,
    shortestInterval: 0,
    startBreakFunction: null,
    stopBreakFunction: null,
    schedule: null,
    intervalTimer: null,
    breakTimer: null,

    // public
    startScheduler(schedule) {
        console.log("Starting the scheduler")

        this.schedule = schedule

        let shortBreak = this.getShortBreak()
        let mediumBreak = this.getMediumBreak()
        let longBreak = this.getLongBreak()

        // Find the shortest active interval
        if (shortBreak?.active) {
            this.shortestInterval = shortBreak.interval
        } else if (mediumBreak?.active) {
            this.shortestInterval = mediumBreak.interval
        } else if (longBreak?.active) {
            this.shortestInterval = longBreak.interval
        }

        // Let interval counter start with shortest interval
        this.intervalCounter = this.shortestInterval

        this.runScheduler()
    },

    // public
    stopScheduler() {
        if (this.intervalTimer) {
            clearTimeout(this.intervalTimer)
        }
        console.warn("Warning: Tried to stop scheduler that was not running.")
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
        // Check if we have atleast one active break. 
        if (!this.getShortBreak()?.active && !this.getMediumBreak()?.active && !this.getLongBreak()?.active) {
            throw "Error: Can't run scheduler with no active breaks"
        }

        console.log("Next break in: " + this.shortestInterval)
        this.intervalTimer = setTimeout(() => {
            this.startNextBreak()
        }, this.shortestInterval * 1000);
    },

    // private
    getShortBreak() {
        if (this.schedule) {
            return this.schedule.shortBreak
        }

        throw "Error: Schedule not defined"
    },

    // private
    getMediumBreak() {
        if (this.schedule) {
            return this.schedule.mediumBreak
        }

        throw "Error: Schedule not defined"
    },

    // private
    getLongBreak() {
        if (this.schedule) {
            return this.schedule.longBreak
        }

        throw "Error: Schedule not defined"
    },

    // private
    breakDone() {
        console.log("Break done")
        this.intervalCounter += this.shortestInterval

        // Make sure callback function is defined.
        if (this.stopBreakFunction) {
            this.stopBreakFunction()
        }

        this.runScheduler()
    },

    // private
    startNextBreak() {
        const duration: number = this.calculateNextBreak()

        console.log("Let's take a break of:" + duration)

        // Make sure callback function is defined.
        if (this.startBreakFunction) {
            this.startBreakFunction(duration)
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

export default breakScheduler

