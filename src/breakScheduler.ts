const BreakScheduler = {
    breaks: new Array<any>(),
    currentBreakIndex: 0,
    isRunning: false,

    // public
    startScheduler() {
        console.log("Starting the scheduler")
        this.runScheduler()
    },

    // private
    runScheduler() {
        this.currentTimer = this.breaks[this.currentBreakIndex]

        console.log("Next break in:" + this.currentTimer.breakInSeconds)
        this.nextBreakInTimer = setTimeout(() => {
            this.startNextBreak()

        }, this.currentTimer.breakInSeconds * 1000);
    },

    // public
    stopScheduler() {
        console.log("Stopping scheduler")

        // Stop all timers
        clearTimeout(this.nextBreakInTimer)
        clearTimeout(this.nextBreakDurationTimer)

        // Reset the index
        this.currentBreakIndex = 0
    },

    // private
    moveToNextBreak() {
        // Move to next index, if we reached the end of array, start over
        if (this.currentBreakIndex >= this.breaks.length - 1) {
            this.currentBreakIndex = 0
        }
        else {
            this.currentBreakIndex++
        }
    },

    // private
    breakDone() {
        console.log("Break done")

        this.moveToNextBreak()

        this.runScheduler()
    },

    // private
    startNextBreak() {
        const nextTimer = this.breaks[this.currentBreakIndex]
        console.log("Let's take a break of:" + nextTimer.duration)
        this.nextBreakDurationTimer = setTimeout(() => {
            this.breakDone()

        }, nextTimer.duration * 1000);
    },

    // public
    skipToNextBreak() {
        console.log("Let's skip to the next break.")
        clearTimeout(this.nextBreakInTimer)
        this.startNextBreak()
    },

    // public
    restartScheduler() {
        console.log("Restarting scheduler")
        this.stopScheduler()
        this.startScheduler()
    }
}

BreakScheduler.breaks.push({ breakInSeconds: 2, duration: 1 })
BreakScheduler.breaks.push({ breakInSeconds: 2000, duration: 5 })

console.log(BreakScheduler.breaks)
BreakScheduler.startScheduler()

setTimeout(() => {
    BreakScheduler.stopScheduler()
}, 5000);

setTimeout(() => {
    BreakScheduler.startScheduler()
}, 7000);

setTimeout(() => {
    BreakScheduler.restartScheduler()
}, 10000);




