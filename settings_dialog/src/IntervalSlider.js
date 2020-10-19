import React from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Slider from "@material-ui/core/Slider"
import Typography from "@material-ui/core/Typography"
import Input from "@material-ui/core/Input"

function IntervalSlider(props) {

  var sbIntervalRange = [5, 10, 15, 20, 25, 30, 40, 50, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600]

  function getShortBreakIntervalRange(x) {
    return sbIntervalRange[x]
  }

  function formatTimeString(x) {
    if (x >= 60) {
      return (x / 60).toString() + " Minutes"
    }
    return x.toString() + " Seconds"
  }


  return (
    <div>
      <Typography id="discrete-slider-custom" gutterBottom>
        {props.label}: {formatTimeString(getShortBreakIntervalRange(props.value))}
      </Typography>
      <Slider
        defaultValue={3}
        step={1}
        marks
        scale={(x) => getShortBreakIntervalRange(x)}
        min={0}
        max={21}
        onChange={props.onChange}
      />
    </div>
  );
}

export default IntervalSlider;
