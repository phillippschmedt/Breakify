import React from 'react';
import Slider from "@material-ui/core/Slider"
import Typography from "@material-ui/core/Typography"

function IntervalSlider(props) {

  function formatTimeString(x) {
    
    // return x
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
      <Typography id="discrete-slider-custom" gutterBottom>
        {props.label}: {formatTimeString(props.range[props.value])}
      </Typography>
      <Slider
        name={props.name}
        step={1}
        scale={(x) => props.range[x]}
        min={0}
        value={props.value}
        max={props.range.length - 1}
        onChange={onChangeHandler}
      />
    </div>
  );
}

export default IntervalSlider;
