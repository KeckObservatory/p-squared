import * as React from 'react';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

const datePickerStyle = {
    margin: '6px',
}

export default function YearMonthPicker() {
    const [value, setValue] = React.useState<Date | null>(new Date());

    return (
        <LocalizationProvider sx={datePickerStyle} dateAdapter={AdapterDateFns}>
            <DatePicker 
                inputFormat="yyyy-MM"
                views={['year', 'month']}
                label="Year and Month"
                minDate={new Date('2012-03-01')}
                maxDate={new Date('2023-06-01')}
                value={value}
                onChange={setValue}
                renderInput={(params) => <TextField {...params} helperText={null} />}
            />
        </LocalizationProvider>
    );
}
