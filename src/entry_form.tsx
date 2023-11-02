import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import { Autocomplete, AutocompleteRenderInputParams, Typography } from "@mui/material";
import {
    Employee,
    EntryState,
    ALL_LOCATIONS,
    REDUCED_LOCATIONS,
    ALTERNATE_PICKUP,
    SUMMIT_LEAD,
    SUPPORT_LEAD,
    CREW_LEAD,
    SEATS
} from './control';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { get_staffinfo, User } from './api';
import { LargeTooltip } from "./App";

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

export const HOURS = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
    "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
]

export const MINUTES = ["0", "30"]

export const SHIFTS = [
    "5:00-15:00",
    "5:00-17:00",
    "7:00-15:00",
    "7:00-17:00",
    "8:00-12:00",
    "8:00-17:00",
    "9:00-17:00",
    "9:00-18:00",
    "12:00-16:00",
    "13:00-17:00",
]

interface Props {
    edit: boolean,
    employees: Employee[]
    entryState: EntryState,
    setEntryState: Function
}


export const EntryForm = (props: Props) => {

    const [show2ndLocation, setShow2ndLocation] = useState(props.entryState.location2 ? true : false)

    const rideboardLocations = ['SU', 'HQ', 'Hilo', 'HP', 'Kona']
    const isRideBoard = rideboardLocations.includes(props.entryState.location) ||
        rideboardLocations.includes(props.entryState.location2 as string)
    console.log('location', props.entryState.location, 'location2', props.entryState.location2, 'isRideboard', isRideBoard)

    const locations = props.entryState.canEdit ? ALL_LOCATIONS : REDUCED_LOCATIONS
    console.log('locations', locations, 'canEdit?', props.entryState.canEdit)

    useEffect(() => {


        if (!props.edit) {

            get_staffinfo()
                .then((user: User) => {
                    const userName = user.LastName + ', ' + user.FirstName

                    // switch when alias becomes available
                    const employee = props.employees.find((employee: Employee) => {
                        return user.Alias.includes(employee.Alias)
                    })

                    props.setEntryState(
                        {
                            ...props.entryState,
                            name: userName,
                            employeeId: employee ? employee.EId : undefined,
                            department: user.Department,
                            baseCamp: user.BaseCamp,
                            staff: user.Alias,
                            alias: user.Alias,
                        }
                    )
                })

        }


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
                    alias: employee?.Alias
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

    const onShift2Change = (value: string) => {
        const [startTime, endTime] = value.split('-')
        const [startHour, startMinutes] = startTime.split(':')
        const [endHour, endMinutes] = endTime.split(':')
        props.setEntryState(
            {
                ...props.entryState,
                startHour2: Number(startHour),
                startMinutes2: Number(startMinutes),
                endHour2: Number(endHour),
                endMinutes2: Number(endMinutes)
            }
        )
    }

    const onStartHour2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, startHour2: JSON.parse(value) }
        )
    }

    const onEndHour2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, endHour2: JSON.parse(value) }
        )
    }


    const onStartMinutes2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, startMinutes2: Number(value) }
        )
    }

    const onEndMinutes2Change = (value: string) => {
        props.setEntryState(
            { ...props.entryState, endMinutes2: Number(value) }
        )
    }


    const addContactNumberIfWFH = (state: EntryState, value: string) => {
        if (value.includes('WFH')) {
            //get employee contact number
            const employee = props.employees.find((employee: Employee) => {
                return props.entryState.alias.includes(employee.Alias)
            })

            const contactNumber = employee?.CellPhone
            const missingContactNumber = contactNumber && !state.comment?.includes(contactNumber)
            if (missingContactNumber) {
                state['comment'] = state.comment ? contactNumber + ', ' + state.comment : contactNumber + ' '
            }
        }
        return state
    }

    const handleLocation2Change = (value: string) => {
        let newState = { ...props.entryState, location2: value } as EntryState
        newState = addContactNumberIfWFH(newState, value)
        props.setEntryState(
            newState
        )
    }

    const onShiftChange = (value: string) => {
        const [startTime, endTime] = value.split('-')
        const [startHour, startMinutes] = startTime.split(':')
        const [endHour, endMinutes] = endTime.split(':')
        props.setEntryState(
            {
                ...props.entryState,
                startHour: Number(startHour),
                startMinutes: Number(startMinutes),
                endHour: Number(endHour),
                endMinutes: Number(endMinutes)
            }
        )
    }

    const onStartHourChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, startHour: Number(value) }
        )
    }

    const onEndHourChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, endHour: Number(value) }
        )
    }

    const onStartMinutesChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, startMinutes: Number(value) }
        )
    }

    const onEndMinutesChange = (value: string) => {
        props.setEntryState(
            { ...props.entryState, endMinutes: Number(value) }
        )
    }

    const handleLocationChange = (value: string) => {
        let newState = { ...props.entryState, location: value } as EntryState
        newState = addContactNumberIfWFH(newState, value)
        props.setEntryState(
            newState
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
            { ...props.entryState, supportLead: value}
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

    const autocompleteInput = (params: AutocompleteRenderInputParams) => {
        return props.edit ? <TextField
            {...params}
            InputLabelProps={{ shrink: true }}
            disabled
            label="Name" /> :
            <TextField
                {...params}
                InputLabelProps={{ shrink: true }}
                label="Name" />
    }


    const supportLeadValue = props.entryState.supportLead ? 
                             SUPPORT_LEAD[Number(props.entryState.supportLead)] 
                             : props.entryState.supportLead
    const strStartMin = JSON.stringify(props.entryState.startMinutes).padStart(2, '0')
    const strEndMin = JSON.stringify(props.entryState.endMinutes).padStart(2, '0')
    const strShift = `${props.entryState.startHour}:${strStartMin}-${props.entryState.endHour}:${strEndMin}`

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
                id="employee-box"
                options={props.employees}
                getOptionLabel={(option) => option.label as string}
                renderInput={(params) => <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    label="Name"
                    disabled={props.edit}
                />}
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
            <TextField
                sx={formControlStyle}
                InputLabelProps={{ shrink: true }}
                disabled
                label={'Staff'}
                id="staff"
                value={props.entryState.staff}
            />
            <div style={{ 'zIndex': 999, "margin": "6px", "marginRight": "0px", "width": "100%" }}>
                <DateRangePicker onChange={onDateRangeChange} value={props.entryState.dateRange} />
            </div>
            <LargeTooltip placement="left" title={"Start time is when you leave the base camp"}>
                <div>
                    <DropDown
                        arr={SHIFTS}
                        value={strShift}
                        handleChange={onShiftChange}
                        label={'Shift Hours'}
                        placeholder={""}
                    />
                </div>
            </LargeTooltip>
            <div style={{ "display": "flex", "marginTop": "16px", "width": "100%" }}>
                <LargeTooltip placement="left" title={"Start time is when you leave the base camp"}>
                    <div>
                        <DropDown
                            arr={HOURS}
                            value={JSON.stringify(props.entryState.startHour)}
                            handleChange={onStartHourChange}
                            label={'Start Hour'}
                            placeholder={""}
                        />
                    </div>
                </LargeTooltip>
                <div>
                    <DropDown arr={HOURS}
                        value={JSON.stringify(props.entryState.endHour)}
                        handleChange={onEndHourChange}
                        label={'End Hour'}
                        placeholder={""}
                    />
                </div>
            </div >
            <div style={{ "display": "flex", "marginTop": "16px", "width": "100%" }}>
                <div>
                    <DropDown
                        arr={MINUTES}
                        value={JSON.stringify(props.entryState.startMinutes)}
                        handleChange={onStartMinutesChange}
                        label={'Start Min'}
                        placeholder={""}
                    />
                </div>
                <div>
                    <DropDown arr={MINUTES}
                        value={JSON.stringify(props.entryState.endMinutes)}
                        handleChange={onEndMinutesChange}
                        label={'End Min'}
                        placeholder={""}
                    />
                </div>
            </div >
            <DropDown
                arr={locations}
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
                        label={'Alternate Pickup Location'}
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
                        value={supportLeadValue}
                        handleChange={handleSupportLeadChange}
                        label={'Support Lead'}
                        placeholder={""}
                    />
                    <LargeTooltip placement="left" title={"Enter additional seats needed"}>
                        <div>
                            <DropDown
                                arr={SEATS}
                                value={props.entryState.seats}
                                handleChange={handleSeatChange}
                                label={'Additional Seats'}
                                placeholder={""}
                            />
                        </div>
                    </LargeTooltip>
                </React.Fragment>
            }
            <Button onClick={handle2ndLocationSelect}>Add 2nd location</Button>
            {
                show2ndLocation &&
                <React.Fragment>
                    <DropDown
                        arr={SHIFTS}
                        value={JSON.stringify(props.entryState.startHour2) + '-' + JSON.stringify(props.entryState.endHour2)}
                        handleChange={onShift2Change}
                        label={'Shift Hours'}
                        placeholder={""}
                    />
                    <div style={{ "display": "flex", "marginTop": "12px", "width": "100%" }}>
                        <DropDown arr={HOURS}
                            value={JSON.stringify(props.entryState.startHour2)}
                            handleChange={onStartHour2Change}
                            label={'Start Hour'}
                            placeholder={""}
                        />
                        <DropDown arr={HOURS}
                            value={JSON.stringify(props.entryState.endHour2)}
                            handleChange={onEndHour2Change}
                            label={'End Hour'}
                            placeholder={""}
                        />
                    </div >
                    <div style={{ "display": "flex", "marginTop": "16px", "width": "100%" }}>
                        <DropDown
                            arr={MINUTES}
                            value={JSON.stringify(props.entryState.startMinutes2)}
                            handleChange={onStartMinutes2Change}
                            label={'Start Min'}
                            placeholder={""}
                        />
                        <DropDown arr={MINUTES}
                            value={JSON.stringify(props.entryState.endMinutes2)}
                            handleChange={onEndMinutes2Change}
                            label={'End Min'}
                            placeholder={""}
                        />
                    </div >
                    <DropDown arr={locations}
                        value={props.entryState.location2}
                        handleChange={handleLocation2Change}
                        label={'Location'}
                        placeholder={""}
                    />
                </React.Fragment>
            }
            <TextField
                focused
                sx={formControlStyle}
                label={'Note'}
                id="note"
                onChange={handleCommentChange}
                value={props.entryState.comment} />
        </Box >
    );
}
