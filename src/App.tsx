import React from 'react';
import './App.css';
import { Control } from './control'
import Box from '@mui/material/Box'

const style = {margin: 'auto', minWidth: '500px', maxWidth: '1500px'}
const App = () => {
  return (
    <React.Fragment>
      <Box 
        justifyContent="center"
        alignItems="center"
        m={5} 
        sx={style}>
        <Control />
      </Box>
    </React.Fragment>
  );
}

export default App;
