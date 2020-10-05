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
    // private
    _schedule: Schedule,
    _intervalCounter: number,
    _shortestInterval: number,
    _intervalTimer?: NodeJS.Timeout,
    _breakTimer?: NodeJS.Timeout,
    _startBreakCallback: Function,
    _stopBreakCallback: Function,
    _runScheduler(): void,
    _breakDone(): void,
    _startNextBreak(): void,
    _calculateNextBreak(): number,
    _getShortBreak(): Break,
    _getMediumBreak(): Break,
    _getLongBreak(): Break,

    // public
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
        _schedule: schedule,
        _intervalCounter: shortestInterval,
        _shortestInterval: shortestInterval,
        _startBreakCallback: startBreakCallback,
        _stopBreakCallback: stopBreakCallback,

        // public
        startScheduler() {
            console.log("Starting scheduler")
            this._runScheduler()
        },

        // public
        stopScheduler() {
            console.log("Stopping scheduler")
            if (this._intervalTimer) {
                clearTimeout(this._intervalTimer)
            }
        },

        // public
        skipToNextBreak() {
            console.log("Skipping to next break.")
            this.stopScheduler()
            this._startNextBreak()
        },

        // public
        restartScheduler() {
            console.log("Restarting scheduler")
            this.stopScheduler()
            this._runScheduler()
        },

        // private
        _runScheduler() {
            console.log("Next break in: " + this._shortestInterval)
            this._intervalTimer = setTimeout(() => {
                this._startNextBreak()
            }, this._shortestInterval * 1000);
        },

        // private
        _getShortBreak() {
            return this._schedule.shortBreak
        },

        // private
        _getMediumBreak() {
            return this._schedule.mediumBreak
        },

        // private
        _getLongBreak() {
            return this._schedule.longBreak
        },

        // private
        _breakDone() {
            console.log("Break done")

            // Notify callback that the break is over
            this._stopBreakCallback()

            // Move to next interval
            this._intervalCounter += this._shortestInterval

            // Start the next interval
            this._runScheduler()
        },

        // private
        _startNextBreak() {
            // Calculates the duration of the next break
            const duration: number = this._calculateNextBreak()

            console.log("Let's take a break of:" + duration)

            // Notify callback about our break
            this._startBreakCallback(duration)

            // Start break timer
            this._breakTimer = setTimeout(() => {
                this._breakDone()

            }, duration * 1000);

        },

        // private
        _calculateNextBreak(): number {
            // Long Break
            let longBreak = this._getLongBreak()
            if (longBreak?.active && this._intervalCounter % longBreak.interval == 0) {
                return longBreak.duration
            }

            // Medium Break
            let mediumBreak = this._getMediumBreak()
            if (mediumBreak?.active && this._intervalCounter % mediumBreak.interval == 0) {
                return mediumBreak.duration
            }

            // Short Break
            let shortBreak = this._getShortBreak()
            return shortBreak.duration


        },
    }
}

