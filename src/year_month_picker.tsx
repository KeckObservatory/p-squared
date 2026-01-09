import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'

const datePickerStyle = {
    margin: '6px',
}

interface Props {
    date: dayjs.Dayjs
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
                renderInput={(params: TextFieldProps) => <TextField {...params} helperText={null} />}
            />
        </LocalizationProvider>
    );
}
