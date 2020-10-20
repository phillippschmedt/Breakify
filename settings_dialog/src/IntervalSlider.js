import React from 'react';
import { Typography, Grid, Slider } from "@material-ui/core"

function IntervalSlider(props) {

  function formatTimeString(x) {
    if (x >= 60) {
      return (x / 60).toString() + " Minutes"
    }
    return x.toString() + " Seconds"
  }

  function onChangeHandler(mouseMoveEvent, value) {
    const name = props.name
    mouseMoveEvent.name = name
    props.onChange(mouseMoveEvent, value)
  }

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Typography id="discrete-slider-custom" gutterBottom>
            {props.label}
          </Typography>
        </Grid>
        <Grid item xs>
          <Slider
            name={props.name}
            step={props.step}
            min={props.min}
            value={props.value}
            max={props.max}
            onChange={onChangeHandler}
          />
        </Grid>
        <Grid item xs>        <Typography>
          {formatTimeString(props.value)}
        </Typography></Grid>
      </Grid>
    </div>
  );
}

export default IntervalSlider;
