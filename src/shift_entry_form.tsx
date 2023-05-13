import React, { useEffect, useState, forwardRef, useImperativeHandle, SyntheticEvent } from "react";
import moment from "moment";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, InputLabel, ListItemText, MenuItem, OutlinedInput, Radio, RadioGroup, Select, SelectChangeEvent, Typography } from "@mui/material";
import {
    Employee,
    ALTERNATE_PICKUP,
    SUMMIT_LEAD,
    SUPPORT_LEAD,
    CREW_LEAD,
    SEATS
} from './control';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import Chip from '@mui/material/Chip';
import { HOURS } from "./entry_form";

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

interface Props {
    employees: Employee[]
    roles: string[]
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export interface DaysOfWeek {
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean
}

export interface ShiftState {
    comment: string,
    selectedRoleEmployees: Employee[],
    seats: string,
    crewLead: string,
    supportLead: string,
    summitLead: string,
    alternatePickup: string,
    location: string,
    startTime: string,
    endTime: string,
    dateRange: [moment.Moment, moment.Moment],
    selectedDaysOfWeek: DaysOfWeek,
}

export const ShiftEntryForm = React.memo(forwardRef((props: Props, _ref) => {

    const [comment, setComment] = useState("")
    const [selectedRoleEmployees, setSelectedRoleEmpoyees] = useState([] as Employee[])
    const [seats, setSeats] = useState("")
    const [crewLead, setCrewLead] = useState("")
    const [supportLead, setSupportLead] = useState("")
    const [summitLead, setSummitLead] = useState("")
    const [alternatePickup, setAlternativePickup] = useState("")
    const [location, setLocation] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [shift, setShift] = useState("")
    const [dateRange, setDateRange] = useState([moment(), moment()])
    const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
    } as DaysOfWeek)

    const daysOfWeek = Object.keys(selectedDaysOfWeek)

    useImperativeHandle(_ref, () => ({
        getChildState: (): ShiftState => {
            return (
                {
                    comment,
                    selectedRoleEmployees,
                    seats,
                    crewLead,
                    supportLead,
                    summitLead,
                    alternatePickup,
                    location: location,
                    startTime,
                    endTime,
                    dateRange,
                    selectedDaysOfWeek,
                } as ShiftState
            )
        }
    }))


    useEffect(() => {

    }, [])

    const handleSelectedEmployeesChange = (event: SyntheticEvent<Element, Event>, 
        newEmps: Employee[], 
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<Employee> | undefined) => {
        setSelectedRoleEmpoyees(newEmps)

    }

    const onDateRangeChange = (value: Date | string) => {
        console.log('dateRange value: ', value) //actually an array
        //@ts-ignore
        setDateRange([moment(value[0]), moment(value[1])])
    }

    const handleDOWChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDaysOfWeek({
            ...selectedDaysOfWeek,
            [event?.target.name]: event?.target.checked
        })
    }

    const handleCommentChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setComment(evt.target.value)
    }

    const handlePickupChange = (value: string) => {
        setAlternativePickup(value)
    }
    const handleSummitLeadChange = (value: string) => {
        setSummitLead(value)
    }
    const handleSupportLeadChange = (value: string) => {
        setSupportLead(value)
    }
    const handleCrewLeadChange = (value: string) => {
        setCrewLead(value)
    }
    const handleSeatChange = (value: string) => {
        setSeats(value)
    }

    const onStartTimeChange = (value: string) => {
        setStartTime(value)
    }

    const onEndTimeChange = (value: string) => {
        setEndTime(value)
    }

    const onLocationChange= (value: string) => {
        setLocation(value)
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
                multiple
                id="tags-standard"
                options={props.employees}
                getOptionLabel={(emp: Employee) => emp.Alias}
                onChange={handleSelectedEmployeesChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Employees"
                        placeholder="Employees"
                    />
                )}
            />
            <DropDown arr={["HQ", "SU", "WFH"]}
                value={location}
                handleChange={onLocationChange}
                label={'Location'}
                placeholder={""}
            />
            <div style={{ 'zIndex': 999, "marginLeft": "6px", "width": "100%" }}>
                <FormLabel component="legend">Date Range</FormLabel>
                <DateRangePicker onChange={onDateRangeChange} value={[dateRange[0].toDate(), dateRange[1].toDate()]} />
            </div>
            <div style={{ "display": "flex", "marginTop": "12px", "width": "100%" }}>
                <DropDown arr={HOURS}
                    value={startTime}
                    handleChange={onStartTimeChange}
                    label={'Start Hour'}
                    placeholder={""}
                />
                <DropDown arr={HOURS}
                    value={endTime}
                    handleChange={onEndTimeChange}
                    label={'End Hour'}
                    placeholder={""}
                />
            </div >
            <div>
                <FormLabel component="legend">Shift Days of Week</FormLabel>
                {daysOfWeek.map((dow: string) => {
                    const checked = selectedDaysOfWeek[dow as keyof DaysOfWeek]
                    return (<FormControlLabel
                        control={
                            <Checkbox checked={checked} onChange={handleDOWChange} name={dow} />
                        }
                        label={dow}
                    />)
                })}
            </div>
            <React.Fragment>
                <Typography>Ride Board Form</Typography>
                <DropDown
                    arr={ALTERNATE_PICKUP}
                    value={alternatePickup}
                    handleChange={handlePickupChange}
                    label={'Alternate Pickup'}
                    placeholder={""}
                />
                <DropDown
                    arr={SUMMIT_LEAD}
                    value={summitLead}
                    handleChange={handleSummitLeadChange}
                    label={'Summit Lead'}
                    placeholder={""}
                />
                <DropDown
                    arr={SUPPORT_LEAD}
                    value={supportLead}
                    handleChange={handleSupportLeadChange}
                    label={'Support Lead'}
                    placeholder={""}
                />

                <Typography>Crew Lead</Typography>
                <FormControl>
                    <RadioGroup
                        row
                        value={crewLead}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            handleCrewLeadChange(event.target.value)
                        }}
                    >
                        {
                            CREW_LEAD.map((cl: string) => {
                                return <FormControlLabel value={cl} control={<Radio />} label={cl} />
                            })
                        }
                    </RadioGroup>
                </FormControl>
                <DropDown
                    arr={SEATS}
                    value={seats}
                    handleChange={handleSeatChange}
                    label={'EXTRA SEATS'}
                    placeholder={""}
                />
            </React.Fragment>
            <TextField
                focused
                sx={formControlStyle}
                label={'Note'}
                id="note"
                onChange={handleCommentChange}
                value={comment} />
        </Box >
    );
}))
