import React from 'react';
import './App.css';
import { Control } from './control'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles';
import Tooltip, {TooltipProps, tooltipClasses} from '@mui/material/Tooltip';

const style = {margin: 'auto', minWidth: '500px', maxWidth: '1500px'}
export const LargeTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: 15,
  },
}));

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
