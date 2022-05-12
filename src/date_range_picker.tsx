//@ts-nocheck
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import DateRangePicker from '@wojtekmaj/react-daterange-picker'

export default function MyDateRangePicker() {
  const [value, onChange] = React.useState([new Date(), new Date()]);

  return (
    <div>
      <DateRangePicker onChange={onChange} value={value} />
    </div>
  );
}