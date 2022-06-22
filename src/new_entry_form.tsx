import React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Typography } from "@mui/material";
import { LOCATIONS, useEntry } from './control'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'
// import TimePicker, { TimePickerValue } from 'react-time-picker';
import { DEPARTMENTS } from './department_select'

const formControlStyle = {
    minWidth: 120,
    width: '100%',
    margin: '6px',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
        // margin: '3px',
    }
}

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


export const NewEntryForm = (props: Props) => {

    const [entryState, setEntryState] = useEntry()

    const handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEntryState(
            { ...entryState, name: evt.target.value }
        )
    }


    const handleDeptChange = (value: string) => {
        setEntryState(
            { ...entryState, department: value }
        )
    }

    const handleAlternatePickupChange = (value: string) => {
        setEntryState(
            { ...entryState, alternatePickup: value }
        )
    }

    const handleLocationChange = (value: string) => {
        setEntryState(
            { ...entryState, location: value }
        )
    }

    const handleBasecampChange = (value: string) => {
        setEntryState(
            { ...entryState, baseCamp: value }
        )
    }


    const handleSeatChange = (value: string) => {
        setEntryState(
            { ...entryState, seats: JSON.parse(value) }
        )
    }

    const onDateRangeChange = (value: any) => {
        console.log('date range selected', value)
        setEntryState({
            ...entryState,
            dateRange: value
        })
    }

    const handleCommentChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEntryState(
            { ...entryState, comment: evt.target.value }
        )
    }
    const onStartTimeChange = (value: string) => {
        setEntryState(
            { ...entryState, startTime: JSON.parse(value) }
        )
    }

    const onEndTimeChange = (value: string) => {
        setEntryState(
            { ...entryState, endTime: JSON.parse(value) }
        )
    }


    const depts = DEPARTMENTS.slice(1)

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                '& .MuiTextField-root': {  },
            }}
        >
            <TextField sx={formControlStyle} label={'Name'} value={entryState.name} onChange={handleNameChange} id="name" />
            <DropDown arr={depts}
                value={entryState.department}
                handleChange={handleDeptChange}
                label={'Department'}
                placeholder={""}
            />
            <DropDown arr={baseCamp}
                value={entryState.baseCamp}
                handleChange={handleBasecampChange}
                label={'Base Camp'}
                placeholder={""}
            />
            {/* <DropDown arr={pickupLocs}
                value={entryState.alternatePickup}
                handleChange={handleAlternatePickupChange}
                label={'Alternative Pickup'}
                placeholder={""}
            />  */}

            <div style={{ "marginLeft": "6px", "width": "100%" }}>
                <DateRangePicker onChange={onDateRangeChange} value={entryState.dateRange} />
            </div>
            <div style={{ "display": "flex", "marginTop": "12px", "width": "100%"}}>
                <DropDown arr={hours}
                    value={JSON.stringify(entryState.startTime)}
                    handleChange={onStartTimeChange}
                    label={'Start Hour'}
                    placeholder={""}
                />
                <DropDown arr={hours}
                    value={JSON.stringify(entryState.endTime)}
                    handleChange={onEndTimeChange}
                    label={'End Hour'}
                    placeholder={""}
                />
            </div >
            {/* <TimePicker onChange={onStartTimeChange} value={state.startTime} />
            <TimePicker onChange={onEndTimeChange} value={state.endTime} /> */}
            <DropDown arr={LOCATIONS}
                value={entryState.location}
                handleChange={handleLocationChange}
                label={'Location'}
                placeholder={""}
            />
            {/* <Typography>Summit Lead</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={entryState.summitLead}
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
                value={entryState.supportLead}
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
                value={entryState.crewLead}
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            </RadioGroup>
            <DropDown arr={additionalSeats}
                handleChange={handleSeatChange}
                label={'Additional Seats'}
                placeholder={""}
                value={JSON.stringify(entryState.seats)}
            /> */}
            {/* <TextField disabled label={'Staff'} id="staff" value={entryState.staff} /> */}
            <TextField sx={formControlStyle} label={'Note'} id="note" onChange={handleCommentChange} value={entryState.comment} />
        </Box>
    );
}
