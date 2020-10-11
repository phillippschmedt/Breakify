// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

// Let the UI start the break progress
window.ipcRenderer.on('duration', function (event, durationInSeconds) {

    // The progressbar
    let progressBarElement = <HTMLProgressElement>document.getElementById("progressBar")

    // The text showing the time remaining
    let timeRemainingElement = <HTMLSpanElement>document.getElementById('progressTimeRemaining')


    // We update our progressbar every 100ms. This calculates how many steps we need to reach the duration.
    let steps = durationInSeconds * 1000 / 100;

    // Initilaize with progress 100%
    let progress = 100;

    // Calculate the step size we need to take every 100ms to reach 0% in 'duration' seconds
    let stepSize = progress / steps;

    // We remember the time at which we started the timer to calculate the seconds since then.
    let startedTime = Date.now();

    let progressIntervalTimer = window.setInterval(() => {
        progressBarElement.value = progress;
        progress = progress - stepSize;

        let timePassedInMilliseconds = Date.now()-startedTime;

        // Duration is in seconds and timePassedInMilliseconds is in milliseconds. That's why we do / 1000
        let timeRemainingInSeconds = durationInSeconds - (timePassedInMilliseconds / 1000);

        // TODO: Properly Format time String (Seconds, Minutes, Hours)
        timeRemainingElement.innerHTML = (Math.ceil(timeRemainingInSeconds)).toString() + " seconds remaining"

        if (progress == 0) {
            clearInterval(progressIntervalTimer)
        }
    }, 100)

});

let finishBreakButton = <HTMLButtonElement>document.getElementById("finishBreakButton")
finishBreakButton.addEventListener('click', () => {
    window.ipcRenderer.send('finishBreakButtonClicked')
})


