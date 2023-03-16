import * as React from 'react';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import moment from 'moment'

const datePickerStyle = {
    margin: '6px',
}

interface Props {
    date: moment.Moment
    handleDateChange: (date: Date | null, keyboardInputValue?: string | undefined) => void
}

export const YearMonthPicker = (props: Props) => {

    return (
        <LocalizationProvider sx={datePickerStyle} dateAdapter={AdapterDateFns}>
            <DatePicker 
                views={['year', 'month', 'day']}
                label="Date"
                value={props.date.toDate()}
                onChange={props.handleDateChange}
                renderInput={(params) => <TextField {...params} helperText={null} />}
            />
        </LocalizationProvider>
    );
}
