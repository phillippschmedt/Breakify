import React from 'react';
import Container from '@material-ui/core/Container';
import IntervalSlider from './IntervalSlider';
import merge from 'lodash/merge'
import range from 'lodash/range'
import { Typography } from '@material-ui/core';

function App() {
  const [state, setState] = React.useState({
    shortBreak: {
      breakIntervalRange: range(300, 13 * 300, 300),
      breakInterval: 0,
    },
    mediumBreak: {
      breakIntervalRange: range(2 * 300, 2 * 13 * 300, 300),
      breakInterval: 0,
    },
    longBreak: {
      breakIntervalRange: range(4 * 300, 4 * 13 * 300, 4 * 300),
      breakInterval: 0,
    },
  });

  function handleBreakInterval(event, value) {
    if (state[event.name].breakInterval !== value) {

      var stateChanges = {
        [event.name]: {
          breakInterval: value
        },
      }

      if (event.name === "shortBreak") {

        // Update Medium Slider
        const newShortBreakIntervalInSeconds = state.shortBreak.breakIntervalRange[value];

        var newMediumIntervalRange = getNextRange(newShortBreakIntervalInSeconds)

        stateChanges.mediumBreak = {
          breakIntervalRange: newMediumIntervalRange,
        }

        // Update Long Slider
        const newMediumBreakIntervalInSeconds = newMediumIntervalRange[state.mediumBreak.breakInterval]

        var newLongIntervalRange = getNextRange(newMediumBreakIntervalInSeconds)

        stateChanges.longBreak = {
          breakIntervalRange: newLongIntervalRange,
        }

      }

      if (event.name === "mediumBreak") {
        // Update Long Slider
        const newMediumBreakIntervalInSeconds = state.mediumBreak.breakIntervalRange[value];

        var newLongIntervalRange = getNextRange(newMediumBreakIntervalInSeconds)

        stateChanges.longBreak = {
          breakIntervalRange: newLongIntervalRange,
        }
      }
    }

    function getNextRange(breakIntervalInSeconds) {
      const newStartInterval = 2 * breakIntervalInSeconds
      const newStopInterval = 2 * 13 * breakIntervalInSeconds
      const newStep = breakIntervalInSeconds
      return range(newStartInterval, newStopInterval, newStep)
    }

    var newState = merge({}, state, stateChanges)
    setState(newState)
  }

  return (
    <>
      <Container maxWidth="sm">
        <Typography
          variant="h6"
          gutterBottom>A short break is meant for a short strech or eye-rest</Typography>
        <IntervalSlider
          name="shortBreak"
          label="Short Break Interval"
          value={state.shortBreak.breakInterval}
          onChange={handleBreakInterval}
          range={state.shortBreak.breakIntervalRange}
        />

        <Typography
          variant="h6"
          gutterBottom>A medium break is meant to get you stand up and moving.</Typography>
        <IntervalSlider
          name="mediumBreak"
          label="Medium Break Interval"
          value={state.mediumBreak.breakInterval}
          onChange={handleBreakInterval}
          range={state.mediumBreak.breakIntervalRange}
        />

        <Typography
          variant="h6"
          gutterBottom>A long break is a serious break and time off your computer. It should be at least 15 minutes.</Typography>
        <IntervalSlider
          name="longBreak"
          label="Long Break Interval"
          value={state.longBreak.breakInterval}
          onChange={handleBreakInterval}
          range={state.longBreak.breakIntervalRange}
        />
      </Container>

    </>
  );
}

export default App;
