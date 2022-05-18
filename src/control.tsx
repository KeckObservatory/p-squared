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

export const Control = (props: Props) => {
    const now = moment()


    // const base = ['Waimea', 'Hilo']

    const initState: ControlState = {
        date: now,
        // base: '',
        location: '',
        departments: []
    }

    const [state, setState] = useState(initState)

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

    // const handleBaseChange = (base: string) => {
    //     setState({
    //         ...state,
    //         base: base
    //     })
    // }
    const handleLocationChange = (location: string) => {
        setState({
            ...state,
            location: location
        })
    }

    return (
        <React.Fragment>
            <Box m={2} >
                <FormControl sx={{ m: 2, width: 150 }}>
                    <YearMonthPicker date={state.date} handleDateChange={handleDateChange} />
                </FormControl>
                {/* <FormControl sx={{ m: 2, width: 100 }}>
                    <DropDown arr={base}
                        handleChange={handleBaseChange}
                        value={state.base}
                        placeholder={'Select Base'}
                        label={'Base'}
                    />
                </FormControl> */}
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
        </React.Fragment>
    )

}