import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, InputLabel, ListItemText, MenuItem, OutlinedInput, Radio, RadioGroup, Select, SelectChangeEvent, Typography } from "@mui/material";
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
    roles: string[]
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface DaysOfWeek {
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean
}

export const ShiftEntryForm = React.memo(forwardRef((props: Props, _ref) => {

    const rideboardLocations = ['SU', 'HQ', 'Hilo', 'HP', 'Kona']

    const [comment, setComment] = useState("")
    const [roleEmployees, setRoleEmployees] = useState([] as Employee[])
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
    const [selectedRole, setSelectedRole] = useState("")
    const [dateRange, setDateRange] = useState([new Date(), new Date()] as [string | Date, string | Date])
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
        getChildState: () => {
            return (
                {
                    comment,
                    selectedRoleEmployees,
                    seats,
                    crewLead,
                    supportLead,
                    summitLead,
                    alternatePickup,
                    location,
                    startTime,
                    endTime,
                    dateRange,
                    selectedDaysOfWeek,
                }
            )
        }
    }))


    useEffect(() => {

    }, [])

    const handleSelectedRoleEmployeesChange = (evt: SelectChangeEvent<Employee[]>) => {
        const {
            target: { value },
        } = evt;
        const newEmps = typeof value === 'string' ? JSON.parse(value) : value
        setSelectedRoleEmpoyees(newEmps)

    }

    const onDateRangeChange = (value: any) => {
        setDateRange(value)
    }

    const handleShiftChange = (value: string) => {
        const values = value.split('-')
        setShift(value)
        setStartTime(JSON.parse(values[0]))
        setEndTime(JSON.parse(values[1]))
    }

    const handleDOWChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDaysOfWeek({
            ...selectedDaysOfWeek,
            [event?.target.name]: event?.target.checked
        })
    }

    const handleRoleChange = (value: string) => {
        setSelectedRole(value)
        setSelectedRoleEmpoyees([])
        const newRoleEmployees = props.employees.filter((employee: Employee) => {
            return employee.Role.includes(value)
        })
        setRoleEmployees(newRoleEmployees)
    }
    const handleLocationChange = (value: string) => {
        setLocation(value)
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

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                '& .MuiTextField-root': {},
            }}
        >
            <DropDown
                arr={props.roles}
                value={selectedRole}
                handleChange={handleRoleChange}
                label={'Role'}
                placeholder={""}
            />
            <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="demo-multiple-checkbox-label">Employees</InputLabel>
                <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={selectedRoleEmployees}
                    onChange={handleSelectedRoleEmployeesChange}
                    input={<OutlinedInput label="Employees" />}
                    renderValue={(selected) => {
                        const names = selected.map((emp: Employee) => {
                            return emp
                        }) as unknown[] as string[]
                        console.log(selected, 'names', names)
                        return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {names.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )
                    }}
                    MenuProps={MenuProps}
                >
                    {roleEmployees.map((emp: Employee) => (
                        <MenuItem key={emp.Alias} value={emp.Alias}>
                            {emp.Alias}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <div style={{ 'zIndex': 999, "marginLeft": "6px", "width": "100%" }}>
                <FormLabel component="legend">Date Range</FormLabel>
                <DateRangePicker onChange={onDateRangeChange} value={dateRange} />
            </div>
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
            <DropDown
                arr={SUMMIT_LEAD}
                value={shift}
                handleChange={handleShiftChange}
                label={'Shift'}
                placeholder={""}
            />
            <DropDown
                arr={rideboardLocations}
                value={location}
                handleChange={handleLocationChange}
                label={'Location'}
                placeholder={""}
            />
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
                    label={'SEATS'}
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
