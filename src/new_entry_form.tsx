import React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Typography } from "@mui/material";
import { LOCATIONS } from './control'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'
// import TimePicker, { TimePickerValue } from 'react-time-picker';


const pickupLocs = [
    "HP",
    "HQ",
    "Hilo",
    "SJP",
    "WJP",
]

const additionalSeats = [
    "1", "2", "3", "4", "5", "6"
]


const hours = [
   "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
   "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
]

const baseCamp = [
    "Waimea", "Hilo"
]

interface Props {

}

interface State {
    baseCamp?: string,
    seats?: number,
    name?: string,
    department?: string,
    comment?: string,
    location?: string
    alternatePickup?: string,
    dateRange: [string | Date, string | Date],
    crewLead?: string,
    supportLead?: string,
    summitLead?: string,
    startTime: string,
    endTime: string,
    staff: string,
}

export const NewEntryForm = (props: Props) => {

    const [state, setState] = React.useState({
        dateRange: [new Date(), new Date()],
        startTime: "8",
        endTime: "16"
    } as State)

    const handleAlternatePickupChange = (value: string) => {
        setState(
            { ...state, alternatePickup: value }
        )
    }

    const handleLocationChange = (value: string) => {
        setState(
            { ...state, location: value }
        )
    }

    const handleBasecampChange = (value: string) => {
        setState(
            { ...state, baseCamp: value }
        )
    }


    const handleSeatChange = (value: string) => {
        setState(
            { ...state, seats: JSON.parse(value) }
        )
    }

    const onDateRangeChange = (value: any) => {
        console.log('date range selected', value)
        setState({ 
            ...state,
            dateRange: value
        })
    }

    const handleCommentChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setState(
            { ...state, comment: evt.target.value }
        )
    }
    const onStartTimeChange = (value: string) => {
        setState(
            { ...state, startTime: value }
        )
    }

    const onEndTimeChange = (value: string ) => {
        setState(
            { ...state, endTime: value }
        )
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                '& .MuiTextField-root': { width: '25ch' },
            }}
        >
            <TextField label={'Last Name'} id="last-name" />
            <TextField label={'Dept'} disabled id="dept" margin="dense" />
            <DropDown arr={baseCamp}
                value={state.baseCamp}
                handleChange={handleBasecampChange}
                label={'Base Camp'}
                placeholder={""}
            />
            <DropDown arr={pickupLocs}
                value={state.alternatePickup}
                handleChange={handleAlternatePickupChange}
                label={'Alternative Pickup'}
                placeholder={""}
            />
            <DateRangePicker onChange={onDateRangeChange} value={state.dateRange} />
            <DropDown arr={hours}
                value={state.startTime}
                handleChange={onStartTimeChange}
                label={'Start Hour'}
                placeholder={""}
            />
            <DropDown arr={hours}
                value={state.endTime}
                handleChange={onEndTimeChange}
                label={'End Hour'}
                placeholder={""}
            />
            {/* <TimePicker onChange={onStartTimeChange} value={state.startTime} />
            <TimePicker onChange={onEndTimeChange} value={state.endTime} /> */}
            <DropDown arr={LOCATIONS}
                value={state.location}
                handleChange={handleLocationChange}
                label={'Location'}
                placeholder={""}
            />
            <Typography>Summit Lead</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={state.summitLead}
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="7-3" control={<Radio />} label="7-3" />
                <FormControlLabel value="7-9" control={<Radio />} label="7-9" />
                <FormControlLabel value="9-5" control={<Radio />} label="9-5" />
                <FormControlLabel value="3-5" control={<Radio />} label="3-5" />
            </RadioGroup>
            <Typography>Summit Support Lead</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={state.supportLead}
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="K1" control={<Radio />} label="K1" />
                <FormControlLabel value="K2" control={<Radio />} label="K2" />
                <FormControlLabel value="K1+K2" control={<Radio />} label="K1+K2" />
            </RadioGroup>
            <Typography>Crew Send</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={state.crewLead}
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            </RadioGroup>
            <DropDown arr={additionalSeats}
                handleChange={handleSeatChange}
                label={'Additional Seats'}
                placeholder={""}
                value={JSON.stringify(state.seats)}
            />
            <TextField disabled label={'Staff'} id="staff" value={state.staff} />
            <TextField label={'Note'} id="note" onChange={handleCommentChange} value={state.comment} />
        </Box>
    );
}
