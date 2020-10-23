import { Break, Schedule, createBreakScheduler, BreakScheduler } from "./BreakScheduler"


let settings = {
    "schedule": {
        "shortBreak": {
            "interval": 5,
            "duration": 10,
            "active": true
        },
        "mediumBreak": {
            "interval": 10,
            "duration": 10,
            "active": true
        },
        "longBreak": {
            "interval": 20,
            "duration": 5,
            "active": false
        }
    },
    "autoFinishBreak": false,
    "fullScreenBreaks": true
}

let scheduler: BreakScheduler

let startBreakCallBack: jest.Mock
let stopBreakCallBack: jest.Mock
let schedulerStartedCallBack: jest.Mock
let schedulerStoppedCallback: jest.Mock

beforeEach(() => {
    jest.useFakeTimers();

    startBreakCallBack = jest.fn()
    stopBreakCallBack = jest.fn()
    schedulerStartedCallBack = jest.fn()
    schedulerStoppedCallback = jest.fn()

    scheduler = createBreakScheduler(
        settings.schedule,
        // Called when a break starts
        startBreakCallBack,
        // Called when a break ends
        stopBreakCallBack,
        // Called when the scheduler is started
        schedulerStartedCallBack,
        // Called when the scheduler is stopped
        schedulerStoppedCallback,
        settings.autoFinishBreak
    )
});

test('test is scheduler is running after starting the scheduler', () => {
    scheduler.startScheduler();
    expect(scheduler.isRunning()).toBe(true);
});

test('callback called after starting', () => {
    scheduler.startScheduler();
    expect(schedulerStartedCallBack).toHaveBeenCalledTimes(1);
});


test('test is scheduler is stopping after running stop', () => {
    scheduler.startScheduler();
    expect(scheduler.isRunning()).toBe(true);

    scheduler.stopScheduler();
    expect(scheduler.isRunning()).toBe(false);
});


test('test scheduler started set timers ', () => {
    scheduler.startScheduler();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 5000);

});


test('full scheduler test', () => {
    // Let's start the scheduler
    scheduler.startScheduler();

    // Make sure the startSchedulerCallback got called once.
    expect(schedulerStartedCallBack).toBeCalledTimes(1)

    // One timer should get set
    expect(setTimeout).toHaveBeenCalledTimes(1);

    // With a 5000 ms delay
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 5000);

    jest.runAllTimers()

    // Make sure the startSchedulerCallback got called once.
    expect(schedulerStartedCallBack).toBeCalledTimes(1)
    expect(startBreakCallBack).toBeCalledTimes(1)
    expect(stopBreakCallBack).toBeCalledTimes(0)

    jest.runAllTimers()

    expect(setTimeout).toHaveBeenCalledTimes(2);
});