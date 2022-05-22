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

export interface Props { }

export interface ControlState {
    // base: string,
    location: string,
    date: moment.Moment
    departments: string[]
}


export const LOCATIONS = [
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
    startTime: string,
    endTime: string,
    staff: string,
}

const EntryContext = React.createContext(null as any);

export const useEntry = () => React.useContext(EntryContext);


export const Control = (props: Props) => {
    const now = moment()

    const initState: ControlState = {
        date: now,
        // base: '',
        location: 'HQ',
        departments: []
    }

    const [state, setState] = useState(initState)

    const [entryState, setEntryState] = React.useState({
        dateRange: [new Date(), new Date()],
        startTime: "8",
        endTime: "16"
    } as EntryState)

    const handleDateChange = (date: Date | null, keyboardInputValue?: string | undefined): void => {
        const d = moment(date)
        console.log(d, date)
        setState({
            ...state,
            date: d
        })
    }

    const handleDepartmentChange = (dept: string[]) => {
        setState({
            ...state,
            departments: dept
        })
    }

    const handleLocationChange = (location: string) => {
        setState({
            ...state,
            location: location
        })
    }

    return (
        <React.Fragment>
            <EntryContext.Provider value={[entryState, setEntryState]}>
            <Box m={2} >
                <FormControl sx={{ m: 2, width: 150 }}>
                    <YearMonthPicker date={state.date} handleDateChange={handleDateChange} />
                </FormControl>
                <FormControl sx={{ m: 2, width: 100 }}>
                    <DropDown arr={LOCATIONS}
                        handleChange={handleLocationChange}
                        value={state.location}
                        placeholder={'Select Location'}
                        label={'Location'}
                    />
                </FormControl>
                <FormControl sx={{ m: 2, width: 300 }}>
                    <DepartmentSelect departments={state.departments} handleDepartmentChange={handleDepartmentChange} />
                </FormControl>
                <div style={{ margin: '6px' }}>
                    <Button variant="contained">Go</Button>
                </div>
                <NewEntryDialog />
            </Box>
            <PTimeline controlState={state} setControlState={setState} />
        </EntryContext.Provider>
        </React.Fragment >
    )

}