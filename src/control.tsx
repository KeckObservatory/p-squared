import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import React, { useState } from 'react'
import DropDown from './drop_down'
import moment from 'moment'
import YearMonthPicker from './year_month_picker'
import Box from '@mui/material/Box'
import { AddEditEntryDialog } from './add_edit_entry_dialog'
import Paper from '@mui/material/Paper'
import { PTimeline } from './p_timeline'
import { get_employees, get_staffinfo, User } from './api'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import { ObjectParam, useQueryParam, withDefault } from 'use-query-params';

export const DATE_FORMAT = 'YYYY-MM-DD'

export interface Props { }

export interface ControlState {
    location: string,
    date: string 
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
    "Remote",
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
    "Remote",
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
    admin?: boolean,
    entryId?: number,
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
        date: now.format(DATE_FORMAT),
        // base: '',
        location: '',
        department: '',
        nameFilter: '',
        idx: 0
    }
    const [employees, setEmployees] = React.useState([] as Employee[])
    const [filtEmployees, setFiltEmployees] = React.useState([] as Employee[])
    const [departments, setDepartments] = React.useState([] as string[])
    // const [state, setState] = useState(initState)
    const [state, setState] = useQueryParam('controlState', withDefault(ObjectParam, initState as any) )

    const [entryState, setEntryState] = React.useState({
        dateRange: [new Date(), new Date()],
        startTime: 8,
        endTime: 17
    } as EntryState)


    React.useEffect(() => {
        const set_emp_and_user = (emps: Employee[], user: User) => {
            if (emps.length > 0) {
                emps = emps.slice(1, emps.length) // remove first entry (*HOLIDAY)
                const labelEmps = emps.map((emp: Employee) => {
                    const label = `${emp.LastName}, ${emp.FirstName}`
                    return { ...emp, label: label }
                })
                setEmployees(labelEmps)
                setFiltEmployees(labelEmps)
                setEntryState(
                    {
                        ...entryState,
                        name: user.LastName + ', ' + user.FirstName,
                        staff: user.Alias,
                        department: user.Department,
                        baseCamp: user.BaseCamp,
                        admin: user?.Admin === 'True'
                    }
                )
            }
        }

        const init_employees = async () => {
            let emps = await get_employees()
            let empDeps = emps.map((emp: Employee) => { return emp.Department })
            let dpnts = Array.from(new Set(empDeps))
            dpnts = ["", ...dpnts]
            console.log('departments ', dpnts)
            setDepartments(dpnts)
            const user = await get_staffinfo()
            set_emp_and_user(emps, user)
        }

        init_employees()

    }, [])

    const handleDateChange = (date: Date | null, keyboardInputValue?: string | undefined): void => {
        const d = moment(date)
        console.log(d, date)
        setState({
            ...state,
            date: d.format(DATE_FORMAT)
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

    const handleEntrySubmit = async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // wait for database to update
        setState({
            ...state
        })
    }

    const handleInputFilterChange = (evt: React.SyntheticEvent, value: string) => {
        console.log(value)
        let newFiltEmployees: Employee[] = []
        employees.map((emp: Employee) => {
            const name = emp.LastName + ", " + emp.FirstName + emp.Alias
            if (name.toUpperCase().includes(value.toUpperCase())) {
                newFiltEmployees.push(emp)
            }
        })
        console.log(newFiltEmployees)
        setFiltEmployees(newFiltEmployees) //WARNING: may not cause rerender
        setState({
            ...state,
            nameFilter: value
        })
    }

    return (
        <Paper sx={{ margin: '4px' }} elevation={3}>
            <Box
            >
                <FormControl sx={{ width: 150, margin: '6px', marginTop: '12px' }}>
                    <YearMonthPicker date={moment(state.date, DATE_FORMAT)} handleDateChange={handleDateChange} />
                </FormControl>
                <FormControl sx={{ width: 100, margin: '6px', marginTop: '6px' }}>
                    <DropDown arr={ABV_LOCATIONS}
                        handleChange={handleLocationChange}
                        value={state.location}
                        placeholder={'Select Location'}
                        label={'Location'}
                    />
                </FormControl>
                <FormControl sx={{ minWidth: 150, marginLeft: '33px', marginTop: '6px' }}>
                    <DropDown arr={departments}
                        handleChange={handleDepartmentChange}
                        value={state.department}
                        placeholder={'Select Department'}
                        label={'Department'}
                    />
                </FormControl>
                <FormControl sx={{ width: 250, marginLeft: '33px', marginTop: '12px' }}>
                    <Autocomplete
                        freeSolo
                        disablePortal
                        id="filter-box-demo"
                        options={employees}
                        //@ts-ignore
                        getOptionLabel={(option) => option.label as string}
                        renderInput={(params) => <TextField
                            {...params}
                            value={state.nameFilter}
                            InputLabelProps={{ shrink: true }}
                            label="Filter Names" />}
                        onInputChange={handleInputFilterChange}
                    />
                </FormControl>
                <AddEditEntryDialog
                    employees={employees}
                    entryState={entryState}
                    edit={false}
                    setEntryState={setEntryState}
                    handleEntrySubmit={handleEntrySubmit} />
            </Box>
            {filtEmployees.length > 0 ? (
                < PTimeline
                    entryState={entryState}
                    setEntryState={setEntryState}
                    handleEntrySubmit={handleEntrySubmit}
                    employees={filtEmployees}
                    controlState={state}
                    setControlState={setState} />
            ) :
                <React.Fragment>
                    <div>Loading table...</div>
                    <Skeleton variant="rectangular" height={118} />
                </React.Fragment>}
        </Paper >
    )

}