import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Calendar } from './calendar'
import { PTimeline } from './p_timeline'
import { Control } from './control'
import Box from '@mui/material/Box'

function App() {
  return (
    <React.Fragment>
      <Box m={5} sx={{minWidth: '500px'}}>
        <Control />
      </Box>
      {/* <Calendar /> */}
    </React.Fragment>
  );
}

export default App;
