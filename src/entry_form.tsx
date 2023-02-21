import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import { Autocomplete, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import {
    Employee,
    EntryState,
    ALL_LOCATIONS,
    ALTERNATE_PICKUP,
    SUMMIT_LEAD,
    SUPPORT_LEAD,
    CREW_LEAD,
    SEATS
} from './control';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { get_staffinfo, User } from './api';

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
    entryState: EntryState,
    setEntryState: Function
}


export const EntryForm = (props: Props) => {

    const [show2ndLocation, setShow2ndLocation] = useState(false)
    const isRideBoard = ['SU', 'HQ', 'Hilo', 'HP', 'Kona'].includes(props.entryState.location)
    console.log('location', props.entryState.location, isRideBoard)

    const isRideBoard2 = props.entryState.location ? ['SU', 'HQ', 'Hilo', 'HP', 'Kona'].includes(props.entryState.location2 as string) : false

    useEffect(() => {

        get_staffinfo()
            .then((user: User) => {
                props.setEntryState(
                    {
                        ...props.entryState,
                        name: user.LastName + ', ' + user.FirstName,
                        department: user.Department,
                        baseCamp: user.BaseCamp,
                        // canEdit: user?.Admin === 'True'
                        canEdit: true 
                    }
                )
            })


    }, [])

    const handleNameChange = (evt: React.SyntheticEvent, employee: Employee | null) => {
        console.log(employee)
        if (employee) {
            props.setEntryState(
                {
                    ...props.entryState,
                    name: employee?.label,
                    department: employee?.Department,
                    baseCamp: employee?.BaseCamp,
                }
            )
        }
        else {
            props.setEntryState(
                {
                    ...props.entryState,
                    name: '',
                    department: '',
                    baseCamp: ''
                }
            )
        }
    }

    const onDateRangeChange = (value: any) => {
        console.log('date range selected', value)
        props.setEntryState({
            ...props.entryState,
            dateRange: value
        })
    }

    const onStartTime2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, startTime2: JSON.parse(value) }
        )
    }

    const onEndTime2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, endTime2: JSON.parse(value) }
        )
    }

    const handleLocation2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, location2: value }
        )
    }
    const onStartTimeChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, startTime: JSON.parse(value) }
        )
    }

    const onEndTimeChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, endTime: JSON.parse(value) }
        )
    }

    const handleLocationChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, location: value }
        )
    }


    const handleCommentChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        props.setEntryState(
            { ...props.entryState, comment: evt.target.value }
        )
    }

    const handlePickupChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, alternatePickup: value }
        )
    }
    const handleSummitLeadChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, summitLead: value }
        )
    }
    const handleSupportLeadChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, supportLead: value }
        )
    }
    const handleCrewLeadChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, crewLead: value }
        )
    }
    const handleSeatChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, seats: value }
        )
    }

    const autoValue = props.employees.find(e => e.label === props.entryState.name)

    const handle2ndLocationSelect = () => {
        setShow2ndLocation(true)
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
                value={autoValue}
                id="combo-box-demo"
                options={props.employees}
                getOptionLabel={(option) => option.label as string}
                renderInput={(params) => <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    label="Name" />}
                // disabled={!entryState.canEdit}} TODO: disable when canEdit is in API
                onChange={handleNameChange}
            />
            <TextField
                sx={formControlStyle}
                InputLabelProps={{ shrink: true }}
                label={'Department'}
                value={props.entryState.department}
                disabled id="department" />
            <TextField
                sx={formControlStyle}
                InputLabelProps={{ shrink: true }}
                label={'Base Camp'}
                value={props.entryState.baseCamp}
                disabled id="base-camp" />
            <TextField disabled label={'Staff'} id="staff" value={props.entryState.staff} />
            <div style={{ 'zIndex': 999, "marginLeft": "6px", "width": "100%" }}>
                <DateRangePicker onChange={onDateRangeChange} value={props.entryState.dateRange} />
            </div>
            <div style={{ "display": "flex", "marginTop": "12px", "width": "100%" }}>
                <DropDown arr={hours}
                    value={JSON.stringify(props.entryState.startTime)}
                    handleChange={onStartTimeChange}
                    label={'Start Hour'}
                    placeholder={""}
                />
                <DropDown arr={hours}
                    value={JSON.stringify(props.entryState.endTime)}
                    handleChange={onEndTimeChange}
                    label={'End Hour'}
                    placeholder={""}
                />
            </div >
            <DropDown
                arr={ALL_LOCATIONS}
                value={props.entryState.location}
                handleChange={handleLocationChange}
                label={'Location'}
                placeholder={""}
            />
            {isRideBoard &&
                <React.Fragment>
                    <Typography>Ride Board Form</Typography>
                    <DropDown
                        arr={ALTERNATE_PICKUP}
                        value={props.entryState.alternatePickup}
                        handleChange={handlePickupChange}
                        label={'Alternate Pickup'}
                        placeholder={""}
                    />
                    <DropDown
                        arr={SUMMIT_LEAD}
                        value={props.entryState.summitLead}
                        handleChange={handleSummitLeadChange}
                        label={'Summit Lead'}
                        placeholder={""}
                    />
                    <DropDown
                        arr={SUPPORT_LEAD}
                        value={props.entryState.supportLead}
                        handleChange={handleSupportLeadChange}
                        label={'Support Lead'}
                        placeholder={""}
                    />

                    <Typography>Crew Lead</Typography>
                    <FormControl>
                        <RadioGroup
                            row
                            value={props.entryState.crewLead}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                handleCrewLeadChange(event.target.value)
                            }}
                        >
                            {
                                CREW_LEAD.map((cl: string) => {
                                    return <FormControlLabel value={cl} control={<Radio />} label={cl} />
                                })
                            }
                            {/* <FormControlLabel value="ofname" control={<Radio />} label="OFNAME" />
                            <FormControlLabel value="koaid" control={<Radio />} label="KOAID" /> */}
                        </RadioGroup>
                    </FormControl>
                    <DropDown
                        arr={SEATS}
                        value={props.entryState.seats}
                        handleChange={handleSeatChange}
                        label={'SEATS'}
                        placeholder={""}
                    />
                </React.Fragment>
            }
            <Button onClick={handle2ndLocationSelect}>Add 2nd location</Button>
            {show2ndLocation &&
                <React.Fragment>
                    <div style={{ "display": "flex", "marginTop": "12px", "width": "100%" }}>
                        <DropDown arr={hours}
                            value={JSON.stringify(props.entryState.startTime2)}
                            handleChange={onStartTime2Change}
                            label={'Start Hour'}
                            placeholder={""}
                        />
                        <DropDown arr={hours}
                            value={JSON.stringify(props.entryState.endTime2)}
                            handleChange={onEndTime2Change}
                            label={'End Hour'}
                            placeholder={""}
                        />
                    </div >
                    <DropDown arr={ALL_LOCATIONS}
                        value={props.entryState.location2}
                        handleChange={handleLocation2Change}
                        label={'Location'}
                        placeholder={""}
                    />
                </React.Fragment>
            }
            <TextField sx={formControlStyle}
                label={'Note'}
                id="note"
                onChange={handleCommentChange}
                value={props.entryState.comment} />
        </Box>
    );
}
