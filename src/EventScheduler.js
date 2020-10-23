"use strict";
exports.__esModule = true;
var EventScheduler = /** @class */ (function () {
    function EventScheduler(func, delay) {
        this.timer = null;
        this.delay = delay;
        this.callback = func;
        this.startedAt = null;
    }
    EventScheduler.prototype.start = function () {
        this.startedAt = Date.now();
        this.timer = setTimeout(this.callback, this.delay * 1000);
    };
    EventScheduler.prototype.cancel = function () {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    };
    return EventScheduler;
}());
exports["default"] = EventScheduler;
