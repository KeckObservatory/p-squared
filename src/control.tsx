import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import React, { useState } from 'react'
import DropDown from './drop_down'
import moment from 'moment'
import YearMonthPicker from './year_month_picker'
import Box from '@mui/material/Box'
import { NewEntryDialog } from './new_entry_dialog'
import DepartmentSelect from './department_select'
import { UrlWithStringQuery } from 'url';
import { PTimeline } from './p_timeline'
import { mock_get_employees, get_employees } from './api'

export interface Props { }

export interface ControlState {
    // base: string,
    location: string,
    date: moment.Moment
    department: string
}

export const LOCATIONS = [
    "",
    "HQ",
    "SU",
    "HP",
    "Hilo",
    "Kona",
    "WFH",
    "Vacation",
    "Sick",
    "FamilySick",
    "JuryDuty",
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
    location: string
    alternatePickup?: string,
    dateRange: [string | Date, string | Date],
    crewLead?: string,
    supportLead?: string,
    summitLead?: string,
    startTime: number,
    endTime: number,
    staff: string,
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
    ModDate: string
}

const EntryContext = React.createContext(null as any);

export const useEntry = () => React.useContext(EntryContext);


export const Control = (props: Props) => {
    const now = moment()

    const initState: ControlState = {
        date: now,
        // base: '',
        location: '',
        department: ''
    }
    const [employees, setEmployees] = React.useState([] as Employee[])

    React.useEffect(() => {

        mock_get_employees().then((emps) => {
            if (emps.length>0) {
                const labelEmps = emps.map((emp: Employee) => {
                    const label = `${emp.LastName}, ${emp.FirstName}`
                    return { ...emp, label: label }
                })
                console.log('num employees', labelEmps.length)
                setEmployees(labelEmps)
            }
        })


    }, [])


    const [state, setState] = useState(initState)

    const [entryState, setEntryState] = React.useState({
        dateRange: [new Date(), new Date()],
        startTime: 8,
        endTime: 16
    } as EntryState)

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

    return (
        <React.Fragment>
            <EntryContext.Provider value={[entryState, setEntryState]}>
                <Box >
                    <FormControl sx={{ width: 150, margin: '6px', marginTop: '22px' }}>
                        <YearMonthPicker date={state.date} handleDateChange={handleDateChange} />
                    </FormControl>
                    <FormControl sx={{ width: 100, margin: '16px', marginTop: '16px' }}>
                        <DropDown arr={LOCATIONS}
                            handleChange={handleLocationChange}
                            value={state.location}
                            placeholder={'Select Location'}
                            label={'Location'}
                        />
                    </FormControl>
                    <FormControl sx={{ width: 150, marginLeft: '33px', marginTop: '16px' }}>
                        <DropDown arr={DEPARTMENTS}
                            handleChange={handleDepartmentChange}
                            value={state.department}
                            placeholder={'Select Department'}
                            label={'Department'}
                        />
                    </FormControl>
                    {/* <FormControl sx={{ m: 2, width: 300, marginTop: '22px'}}>
                    <DepartmentSelect departments={state.department} handleDepartmentChange={handleDepartmentChange} />
                </FormControl> */}
                    {/* <div style={{ margin: '9px' }}>
                    <Button variant="contained">Go</Button>
                </div> */}
                    <NewEntryDialog employees={employees} handleEntrySubmit={handleEntrySubmit} />
                </Box>
                <PTimeline controlState={state} setControlState={setState} />
            </EntryContext.Provider>
        </React.Fragment >
    )

}