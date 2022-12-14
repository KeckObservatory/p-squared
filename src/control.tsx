import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import React, { useState } from 'react'
import DropDown from './drop_down'
import moment from 'moment'
import YearMonthPicker from './year_month_picker'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { NewEntryDialog } from './new_entry_dialog'
import Paper from '@mui/material/Paper'
import DepartmentSelect from './department_select'
import { UrlWithStringQuery } from 'url';
import { PTimeline } from './p_timeline'
import { mock_get_employees, get_employees, get_staffinfo } from './api'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export interface Props { }

export interface ControlState {
    // base: string,
    location: string,
    date: moment.Moment
    department: string
    nameFilter: string
    idx: number
}

export const ABV_LOCATIONS = [
    "",
    "HQ",
    "SU",
    "HP",
    "Hilo",
    "Kona",
    "WFH",
    "Leave",
    "Travel",
    "Other",
]

export const ALL_LOCATIONS = [
    "",
    "HQ",
    "SU",
    "HP",
    "Hilo",
    "Kona",
    "WFH",
    "Sick",
    "Vacation",
    "JuryDuty",
    "FamilySick",
    "Travel",
    "Other",
]

export const DEPARTMENTS = [
    '',
    'Administration',
    'AO/Optics',
    'Development Program Support',
    'Directorate Office',
    'Engineering',
    'Finance',
    'Observing Support',
    'Operations & Infrastructure',
    'Scientific Software',
    'Software',
    'Systems Administration',
    'Council',
    'Guest'
];


export interface EntryState {
    baseCamp?: string,
    seats?: number,
    name?: string,
    department?: string,
    comment?: string,
    location: string,
    alternatePickup?: string,
    dateRange: [string | Date, string | Date],
    crewLead?: string,
    supportLead?: string,
    summitLead?: string,
    startTime: number,
    endTime: number,
    startTime2?: number,
    endTime2?: number,
    location2?: string,
    staff: string,
    admin?: boolean
}
export interface User {
    Status: string,
    Alias: string,
    FirstName: string,
    LastName: string,
    Department: string,
    Role: string,
    BaseCamp: string,
    HomePhone: string,
    CellPhone: string,
    OfficePhone: string,
    SummitPhone: string,
    Admin?: string
}

export interface Employee {
    label?: string
    Alias: string,
    FirstName: string,
    LastName: string,
    EId: string,
    Department: string,
    Role: string,
    BaseCamp: string,
    HomePhone: string,
    CellPhone: string,
    CarrierAddr: string,
    OfficePhone: string,
    SummitPhone: string,
    DelFlag: string,
    ModDate: string,
    PrimaryLocation?: string,
    PrimaryShift?: string,
}

export const Control = (props: Props) => {
    const now = moment()

    const initState: ControlState = {
        date: now,
        // base: '',
        location: '',
        department: '',
        nameFilter: '',
        idx: 0
    }
    const [employees, setEmployees] = React.useState([] as Employee[])
    const [filtEmployees, setFiltEmployees] = React.useState([] as Employee[])
    const [state, setState] = useState(initState)

    const [entryState, setEntryState] = React.useState({
        dateRange: [new Date(), new Date()],
        startTime: 8,
        endTime: 17
    } as EntryState)


    React.useEffect(() => {

        get_employees().then((emps) => {
            if (emps.length > 0) {
                emps = emps.slice(1, emps.length) // remove first entry (*HOLIDAY)
                const labelEmps = emps.map((emp: Employee) => {
                    const label = `${emp.LastName}, ${emp.FirstName}`
                    return { ...emp, label: label }
                })
                setEmployees(labelEmps)
                setFiltEmployees(labelEmps)
            }
        })


        get_staffinfo()
            .then((output: object) => {
                const user = output as User
                setEntryState(
                    {
                        ...entryState,
                        name: user.LastName + ', ' + user.FirstName,
                        department: user.Department,
                        baseCamp: user.BaseCamp,
                        admin: user?.Admin === 'True'
                    }
                )
            })


    }, [])

    const handleDateChange = (date: Date | null, keyboardInputValue?: string | undefined): void => {
        const d = moment(date)
        console.log(d, date)
        setState({
            ...state,
            date: d
        })
    }

    const handleDepartmentChange = (dept: string) => {
        setState({
            ...state,
            department: dept
        })
    }

    const handleLocationChange = (location: string) => {
        setState({
            ...state,
            location: location
        })
    }

    const handleEntrySubmit = () => {
        setState({
            ...state
        })
    }

    const handleInputFilterChange = (evt: React.SyntheticEvent, value: string) => {
        console.log(value)
        setState({
            ...state,
            nameFilter: value
        })
        let newFiltEmployees: Employee[] = []
        employees.map((emp: Employee) => {
            const name = emp.LastName + ", " + emp.FirstName + emp.Alias
            if(name.toUpperCase().includes(value.toUpperCase())) {
                newFiltEmployees.push(emp)
            }
        })
        console.log(newFiltEmployees)
        setFiltEmployees(newFiltEmployees) //WARNING: may not cause rerender
        handleEntrySubmit() //this will force a rerender
    }

    return (
        <Paper sx={{ margin: '4px' }} elevation={3}>
            <Box 
            >
                <FormControl sx={{ width: 150, margin: '6px', marginTop: '22px' }}>
                    <YearMonthPicker date={state.date} handleDateChange={handleDateChange} />
                </FormControl>
                <FormControl sx={{ width: 100, margin: '16px', marginTop: '16px' }}>
                    <DropDown arr={ABV_LOCATIONS}
                        handleChange={handleLocationChange}
                        value={state.location}
                        placeholder={'Select Location'}
                        label={'Location'}
                    />
                </FormControl>
                <FormControl sx={{ minWidth: 150, marginLeft: '33px', marginTop: '16px' }}>
                    <DropDown arr={DEPARTMENTS}
                        handleChange={handleDepartmentChange}
                        value={state.department}
                        placeholder={'Select Department'}
                        label={'Department'}
                    />
                </FormControl>
                <FormControl sx={{ width: 250, marginLeft: '33px', marginTop: '22px' }}>
                    <Autocomplete
                        // sx={{ ...formControlStyle, marginTop: '12px' }}
                        disablePortal
                        id="filter-box-demo"
                        options={employees}
                        getOptionLabel={(option) => option.label as string}
                        renderInput={(params) => <TextField
                            value={state.nameFilter}
                            {...params}
                            InputLabelProps={{ shrink: true }}
                            label="Filter Names" />}
                        // disabled={!entryState.admin}} TODO: disable when admin is in API
                        // onChange={handleFilterChange}
                        onInputChange={handleInputFilterChange}
                    />
                </FormControl>
                <NewEntryDialog
                    employees={employees}
                    entryState={entryState}
                    setEntryState={setEntryState}
                    handleEntrySubmit={handleEntrySubmit} />
            </Box>
            {filtEmployees.length > 0 ? (
                < PTimeline employees={filtEmployees} controlState={state} setControlState={setState} />
            ) : <div>Loading table...</div>}
        </Paper >
    )

}