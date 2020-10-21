import React from 'react';
import Container from '@material-ui/core/Container';
import IntervalSlider from './IntervalSlider';
import merge from 'lodash/merge'
import { Switch, FormControlLabel } from '@material-ui/core';

function App() {
  const [state, setState] = React.useState({
    "schedule": {
      "shortBreak": {
        "interval": 60,
        "duration": 5,
        "active": true
      },
      "mediumBreak": {
        "interval": 120,
        "duration": 10,
        "active": true
      },
      "longBreak": {
        "interval": 240,
        "duration": 5,
        "active": false
      }
    },
    "autoFinishBreak": false,
    "fullScreenBreaks": true
  });

  // Handle short slider changes
  function onChangeHandler(event, value) {
    // Set value of current slider
    let stateChanges = {
      schedule: {
        [event.name]: {
          interval: value
        },
      }
    }

    if (event.name !== "mediumBreak" && event.name !== "longBreak") {
      // Set the medium sliders value based on the current ratio between medium and short slider
      let mediumToShortRadio = state.schedule.mediumBreak.interval / state.schedule.shortBreak.interval
      stateChanges.schedule.mediumBreak = {
        interval: mediumToShortRadio * value
      }
    }

    if (event.name !== "longBreak") {
      // Set the long sliders value based on the current ratio between long and medium slider
      let longToShortRadio = state.schedule.longBreak.interval / state.schedule.mediumBreak.interval
      stateChanges.schedule.longBreak = {
        interval: longToShortRadio * stateChanges.schedule.mediumBreak.interval
      }
    }

    var newState = merge({}, state, stateChanges)
    setState(newState)
  }

  function toggleFullScreenSwitch() {
    var newState = {
      fullScreenBreaks: !state.fullScreenBreaks
    }
    setState(merge({}, state, newState))
  }

  function toggleAutoFinishBreak() {
    var newState = {
      autoFinishBreak: !state.autoFinishBreak
    }
    setState(merge({}, state, newState))
  }

  function handleSubmit(event) {
    console.log(state);
    window.ipcRenderer.send('settingsSaved', state)
    event.preventDefault();
  }

  return (
    <>
      <Container maxWidth="sm">

        <form onSubmit={handleSubmit}>
          <FormControlLabel
            label="Show breaks in fullscreen"
            control={
              <Switch color="primary" checked={state.fullScreenBreaks} onChange={toggleFullScreenSwitch} />}

          />

          <FormControlLabel
            label="Automatically finish break when time isup"
            control={
              <Switch color="primary" checked={state.autoFinishBreak} onChange={toggleAutoFinishBreak} />}

          />

          <IntervalSlider
            name="shortBreak"
            label="Short Break Interval"
            step={60}
            min={60}
            value={state.schedule.shortBreak.interval}
            max={13 * 60}
            onChange={onChangeHandler}
          />

          <IntervalSlider
            name="mediumBreak"
            label="Medium Break Interval"
            step={2 * state.schedule.shortBreak.interval}
            min={2 * state.schedule.shortBreak.interval}
            value={state.schedule.mediumBreak.interval}
            max={2 * 13 * state.schedule.shortBreak.interval}
            onChange={onChangeHandler}
          />

          <IntervalSlider
            name="longBreak"
            label="Long Break Interval"
            step={2 * state.schedule.mediumBreak.interval}
            min={2 * state.schedule.mediumBreak.interval}
            value={state.schedule.longBreak.interval}
            max={2 * 13 * state.schedule.mediumBreak.interval}
            onChange={onChangeHandler}
          />

          <input type="submit" value="Submit" />
        </form>

      </Container>


    </>
  );
}

export default App;
