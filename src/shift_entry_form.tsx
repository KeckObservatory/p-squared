import React, { useEffect, useState, forwardRef, useImperativeHandle, SyntheticEvent } from "react";
import moment from "moment";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Checkbox, FormControlLabel, FormLabel, Typography } from "@mui/material";
import {
    Employee,
    ALTERNATE_PICKUP,
    SUMMIT_LEAD,
    SUPPORT_LEAD,
    SEATS
} from './control';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { HOURS, SHIFTS, MINUTES } from "./entry_form";
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

interface Props {
    employees: Employee[],
    roles: string[]
}

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
    selectedEmployees: Employee[],
    seats: string,
    crewLead: string,
    supportLead: string,
    summitLead: string,
    alternatePickup: string,
    location: string,
    startHour: string,
    endHour: string,
    startMinutes: string,
    endMinutes: string
    dateRange: [moment.Moment, moment.Moment],
    selectedDaysOfWeek: DaysOfWeek,
}

export const ShiftEntryForm = React.memo(forwardRef((props: Props, _ref) => {

    const [comment, setComment] = useState("")
    const [selectedEmployees, setSelectedEmployees] = useState([] as Employee[])
    const [seats, setSeats] = useState("")
    const [crewLead, setCrewLead] = useState("")
    const [role, setRole] = useState("")
    const [supportLead, setSupportLead] = useState("")
    const [summitLead, setSummitLead] = useState("")
    const [alternatePickup, setAlternativePickup] = useState("")
    const [location, setLocation] = useState("")
    const [startHour, setStartHour] = useState("")
    const [endHour, setEndHour] = useState("")
    const [startMinutes, setStartMinutes] = useState("0")
    const [endMinutes, setEndMinutes] = useState("0")
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
                    selectedEmployees,
                    seats,
                    crewLead,
                    supportLead,
                    summitLead,
                    alternatePickup,
                    location: location,
                    startHour,
                    endHour,
                    startMinutes,
                    endMinutes,
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

        setSelectedEmployees(newEmps)

    }

    const onRoleChange = (value: string) => {
        const employeeList: Employee[] = []
        props.employees.forEach((employee: Employee) => {
            if (employee.Role.toUpperCase().includes(value.toUpperCase())) {
                employeeList.push(employee)
            }
        })
        console.log('employeeList', employeeList)
        setRole(value)
        setSelectedEmployees(employeeList)
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

    const handleSeatChange = (value: string) => {
        setSeats(value)
    }

    const onShiftChange = (value: string) => {
        const [startTime, endTime] = value.split('-')
        const [startHour, startMinutes] = startTime.split(':')
        const [endHour, endMinutes] = endTime.split(':')
        
        setStartHour(startHour)
        setEndHour(endHour)
        setStartMinutes(startMinutes.includes('00') ? '0' : '00')
        setEndMinutes(endMinutes.includes('00') ? '0' : '00')
    }

    const onStartHourChange = (value: string) => {
        setStartHour(value)
    }

    const onEndHourChange = (value: string) => {
        setEndHour(value)
    }


    const onStartMinutesChange = (value: string) => {
        setStartMinutes(value)
    }

    const onEndMinutesChange = (value: string) => {
        setEndMinutes(value)
    }

    const onLocationChange = (value: string) => {
        setLocation(value)
    }


    const strStartMin = startMinutes.padStart(2, '0')
    const strEndMin = endMinutes.padStart(2, '0')
    const strShift = `${startHour}:${strStartMin}-${endHour}:${strEndMin}`

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
                value={selectedEmployees}
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
            <DropDown arr={props.roles}
                value={role}
                handleChange={onRoleChange}
                label={'Role'}
                placeholder={""}
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
            <LargeTooltip placement="left" title={"Ride leaves 2 hours before shift start"}>
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
            <div style={{ "display": "flex", "marginTop": "12px", "width": "100%" }}>

                <LargeTooltip placement="left" title={"Ride leaves 2 hours before shift start"}>
                    <div>
                        <DropDown arr={HOURS}
                            value={startHour}
                            handleChange={onStartHourChange}
                            label={'Start Hour'}
                            placeholder={""}
                        />
                    </div>
                </LargeTooltip>
                <div>
                    <DropDown arr={HOURS}
                        value={endHour}
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
                        value={startMinutes}
                        handleChange={onStartMinutesChange}
                        label={'Start Min'}
                        placeholder={""}
                    />
                </div>
                <div>
                    <DropDown arr={MINUTES}
                        value={endMinutes}
                        handleChange={onEndMinutesChange}
                        label={'End Min'}
                        placeholder={""}
                    />
                </div>
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
                <LargeTooltip placement="left" title={"Ride leaves 2 hours before shift start"}>
                    <div>
                        <DropDown
                            arr={SUMMIT_LEAD}
                            value={summitLead}
                            handleChange={handleSummitLeadChange}
                            label={'Summit Lead'}
                            placeholder={""}
                        />
                    </div>
                </LargeTooltip>
                <DropDown
                    arr={SUPPORT_LEAD}
                    value={supportLead}
                    handleChange={handleSupportLeadChange}
                    label={'Support Lead'}
                    placeholder={""}
                />
                <LargeTooltip placement="left" title={"Enter additional seats needed"}>
                    <div>
                        <DropDown
                            arr={SEATS}
                            value={seats}
                            handleChange={handleSeatChange}
                            label={'EXTRA SEATS'}
                            placeholder={""}
                        />
                    </div>
                </LargeTooltip>
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
