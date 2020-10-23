import EventScheduler from "./EventScheduler"

test("test if scheduler properly starts and runs callback", () => {
    jest.useFakeTimers();

    let delay = 2000;
    let callBack = jest.fn()

    let scheduler = new EventScheduler(callBack, delay);
    scheduler.start();

    jest.runAllTimers();

    expect(setTimeout).toBeCalledTimes(1)
    expect(setTimeout).toBeCalledWith(callBack, delay)
    expect(callBack).toBeCalledTimes(1)
})

test("tests if scheduler properly cancels", () => {
    jest.useFakeTimers();

    let delay = 1000;

    let callBack = jest.fn()

    let scheduler = new EventScheduler(callBack, delay);
    scheduler.start();

    expect(setTimeout).toBeCalledTimes(1)
    expect(setTimeout).toBeCalledWith(callBack, delay)

    scheduler.cancel();

    jest.runAllTimers();

    expect(callBack).not.toBeCalled()
})