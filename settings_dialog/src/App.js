import React from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Slider from "@material-ui/core/Slider"
import Typography from "@material-ui/core/Typography"
import Input from "@material-ui/core/Input"
import IntervalSlider from './IntervalSlider';

function App() {

  const [state, setState] = React.useState({
    shortBreak: {
      value: 0
    }
  });

  function handleShortBreakchange(e, value) {
    setState({
      shortBreak: {
        value: value
      }
    }) 
  }

  return (
    <Container maxWidth="sm">
      <IntervalSlider
        label="Short Break Interval"
        value={state.shortBreak.value}
        onChange={handleShortBreakchange}
      />
    </Container>
  );
}

export default App;
