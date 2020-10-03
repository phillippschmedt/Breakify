"use strict";
/*

Todo:

* Add notification before next break
* Add skip to next break (Cancel current timer, immediately run next break)
* Reset breaks (cancel all timers, reset index, runScheduler())

*/
exports.__esModule = true;
var BreakScheduler = {
    breaks: new Array(),
    currentBreakIndex: 0,
    isRunning: false,
    // public
    startScheduler: function () {
        console.log("Starting the scheduler");
        this.runScheduler();
    },
    // private
    runScheduler: function () {
        var _this = this;
        this.currentTimer = this.breaks[this.currentBreakIndex];
        console.log("Next break in:" + this.currentTimer.breakInSeconds);
        this.nextBreakInTimer = setTimeout(function () {
            _this.startNextBreak();
        }, this.currentTimer.breakInSeconds * 1000);
    },
    // public
    stopScheduler: function () {
        // Stop the timer for the next break
        console.log("Stopping scheduler");
        clearTimeout(this.nextBreakInTimer);
        clearTimeout(this.nextBreakDurationTimer);
        this.currentBreakIndex = 0;
        // Todo: Close Break Window
        // Todo: Stop Break Timer
    },
    // private
    moveToNextBreak: function () {
        // Move to next index, if we reached the end of array, start over
        if (this.currentBreakIndex >= this.breaks.length - 1) {
            this.currentBreakIndex = 0;
        }
        else {
            this.currentBreakIndex++;
        }
    },
    // private
    breakDone: function () {
        console.log("Break done");
        this.moveToNextBreak();
        this.runScheduler();
    },
    // private
    startNextBreak: function () {
        var _this = this;
        var nextTimer = this.breaks[this.currentBreakIndex];
        console.log("Let's take a break of:" + nextTimer.duration);
        this.nextBreakDurationTimer = setTimeout(function () {
            _this.breakDone();
        }, nextTimer.duration * 1000);
    },
    // public
    skipToNextBreak: function () {
        console.log("Let's skip to the next break.");
        clearTimeout(this.nextBreakInTimer);
        this.startNextBreak();
    },
    // public
    restartScheduler: function () {
        console.log("Restarting scheduler");
        this.stopScheduler();
        this.startScheduler();
    }
};
BreakScheduler.breaks.push({ breakInSeconds: 2, duration: 1 });
BreakScheduler.breaks.push({ breakInSeconds: 2000, duration: 5 });
console.log(BreakScheduler.breaks);
BreakScheduler.startScheduler();
setTimeout(function () {
    BreakScheduler.stopScheduler();
}, 5000);
setTimeout(function () {
    BreakScheduler.startScheduler();
}, 7000);
setTimeout(function () {
    BreakScheduler.restartScheduler();
}, 10000);
