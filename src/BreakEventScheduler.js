"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var events_1 = require("events");
var EventScheduler_1 = require("./EventScheduler");
var BreakEventScheduler = /** @class */ (function (_super) {
    __extends(BreakEventScheduler, _super);
    // The breakscheduler expects a properly constructed schedule to be initialized.
    // TODO: Write test for invalid schedules
    function BreakEventScheduler(schedule) {
        var _a, _b, _c;
        var _this = _super.call(this) || this;
        _this.schedule = schedule;
        _this.eventScheduler = null;
        // Makes sure we have at least one active break and sets the shortest interval.
        if ((_a = schedule.shortBreak) === null || _a === void 0 ? void 0 : _a.active) {
            _this.shortestInterval = schedule.shortBreak.interval;
        }
        else if ((_b = schedule.mediumBreak) === null || _b === void 0 ? void 0 : _b.active) {
            _this.shortestInterval = schedule.mediumBreak.interval;
        }
        else if ((_c = schedule.longBreak) === null || _c === void 0 ? void 0 : _c.active) {
            _this.shortestInterval = schedule.longBreak.interval;
        }
        else {
            throw "Error: Invalid schedule passed to BreakScheduler";
        }
        _this.intervalCounter = _this.shortestInterval;
        _this.isRunning = false;
        _this.on('breakStart', function (breakDuration) {
            var _a;
            console.log("break started");
            (_a = _this.eventScheduler) === null || _a === void 0 ? void 0 : _a.cancel();
            _this.eventScheduler = new EventScheduler_1["default"](function () { _this.emit('breakEnded'); }, breakDuration);
            _this.eventScheduler.start();
        });
        _this.on('breakEnded', function (breakDuration) {
            var _a;
            console.log("breakEnded");
            (_a = _this.eventScheduler) === null || _a === void 0 ? void 0 : _a.cancel();
            _this.next();
        });
        return _this;
    }
    // Returns the duration of the next break
    BreakEventScheduler.prototype.calculateNextBreak = function () {
        // Long Break
        var longBreak = this.schedule.longBreak;
        if ((longBreak === null || longBreak === void 0 ? void 0 : longBreak.active) && this.intervalCounter % longBreak.interval == 0) {
            return longBreak.duration;
        }
        // Medium Break
        var mediumBreak = this.schedule.mediumBreak;
        if ((mediumBreak === null || mediumBreak === void 0 ? void 0 : mediumBreak.active) && this.intervalCounter % mediumBreak.interval == 0) {
            return mediumBreak.duration;
        }
        // Short Break
        var shortBreak = this.schedule.shortBreak;
        return shortBreak.duration;
    };
    // Schedule the next interval
    BreakEventScheduler.prototype.next = function () {
        var _this = this;
        console.log("Scheduling next break");
        var nextBreakDuration = this.calculateNextBreak();
        this.eventScheduler = new EventScheduler_1["default"](function () { _this.emit('breakStart', nextBreakDuration); }, this.shortestInterval);
        this.eventScheduler.start();
    };
    return BreakEventScheduler;
}(events_1.EventEmitter));
var settings = {
    "schedule": {
        "shortBreak": {
            "interval": 5,
            "duration": 5,
            "active": true
        },
        "mediumBreak": {
            "interval": 10,
            "duration": 10,
            "active": true
        },
        "longBreak": {
            "interval": 45,
            "duration": 5,
            "active": false
        }
    },
    "autoFinishBreak": false,
    "fullScreenBreaks": true
};
var scheduler = new BreakEventScheduler(settings.schedule);
scheduler.next();
exports["default"] = BreakEventScheduler;
