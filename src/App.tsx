import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Calendar } from './calendar'
import { PTimeline } from './p_timeline'
import { Control } from './control'
import Box from '@mui/material/Box'
import MobiscrollDemo from './mobiscroll_demo';

const style = {margin: 'auto', minWidth: '500px', maxWidth: '1500px'}
function App() {
  return (
    <React.Fragment>
      <Box 
        justifyContent="center"
        alignItems="center"
        m={5} 
        sx={style}>
        <Control />
      </Box>
      <MobiscrollDemo />
    </React.Fragment>
  );
}

export default App;
