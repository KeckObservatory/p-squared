import React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import { Autocomplete, Typography } from "@mui/material";
import { Employee, LOCATIONS, useEntry } from './control'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'
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

const hours = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
    "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
]

interface Props {
    employees: Employee[]
}


export const NewEntryForm = (props: Props) => {

    const [entryState, setEntryState] = useEntry()

    const handleNameChange = (evt: React.SyntheticEvent, employee: Employee | null) => {
        console.log(employee)
        if (employee) {
            setEntryState(
                {
                    ...entryState,
                    name: employee?.label,
                    department: employee?.Department,
                    baseCamp: employee?.BaseCamp
                }
            )
        }
        else {
            setEntryState(
                {
                    ...entryState,
                    name: '',
                    department: '',
                    baseCamp: ''
                }
            )
        }
    }

    const handleLocationChange = (value: string) => {
        setEntryState(
            { ...entryState, location: value }
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

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                '& .MuiTextField-root': {},
            }}
        >
            <Autocomplete
                sx={{ ...formControlStyle, marginTop: '12px' }}
                disablePortal
                id="combo-box-demo"
                options={props.employees}
                getOptionLabel={(option) => option.label as string}
                renderInput={(params) => <TextField 
                    {...params} 
                    InputLabelProps={{shrink:true}}
                    label="Name" />}
                onChange={handleNameChange}
            />
            <TextField
                sx={formControlStyle}
                InputLabelProps={{shrink:true}}
                label={'Department'}
                value={entryState.department}
                disabled id="department" />
            <TextField
                sx={formControlStyle}
                InputLabelProps={{shrink:true}}
                label={'Base Camp'}
                value={entryState.baseCamp}
                disabled id="base-camp" />
            <div style={{ "marginLeft": "6px", "width": "100%" }}>
                <DateRangePicker onChange={onDateRangeChange} value={entryState.dateRange} />
            </div>
            <div style={{ "display": "flex", "marginTop": "12px", "width": "100%" }}>
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
            <DropDown arr={LOCATIONS}
                value={entryState.location}
                handleChange={handleLocationChange}
                label={'Location'}
                placeholder={""}
            />
            {/* <TextField disabled label={'Staff'} id="staff" value={entryState.staff} /> */}
            <TextField sx={formControlStyle} label={'Note'} id="note" onChange={handleCommentChange} value={entryState.comment} />
        </Box>
    );
}
