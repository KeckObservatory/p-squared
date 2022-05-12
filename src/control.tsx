import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import React from 'react'
import DropDown from './drop_down'
import moment from 'moment'
import YearMonthPicker from './year_month_picker'
import Box from '@mui/material/Box'
import { NewEntryDialog } from './new_entry_dialog'
import DepartmentSelect from './department_select'

export interface Props { }

export const Control = (props: Props) => {
    const now = moment()

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const locations = ['HQ', 'Summit', 'HP', 'Hilo', 'Other']
    const base = ['Waimea', 'Hilo']
    const years = [now.subtract(1, 'years').format('YYYY'), now.format('YYYY'), now.add(1, 'years').format('YYYY')]
    const handleMonthChange = () => { }
    const handleYearChange = () => { }
    const handleBaseChange = () => { }
    const handleLocationChange = () => { }

    return (
        <React.Fragment>
            <Box m={2} >
                <FormControl sx={{ m: 2, width: 150 }}>
                    <YearMonthPicker />
                </FormControl>
                <FormControl sx={{ m: 2, width: 100 }}>
                    <DropDown arr={base}
                        handleChange={handleBaseChange}
                        placeholder={'Select Base'}
                        label={'Base'}
                    />
                </FormControl>
                <FormControl sx={{ m: 2, width: 100 }}>
                    <DropDown arr={locations}
                        handleChange={handleLocationChange}
                        placeholder={'Select Location'}
                        label={'Location'}
                    />
                </FormControl>
                <FormControl sx={{ m: 2, width: 300 }}>
                    <DepartmentSelect />
                </FormControl>
                <div style={{margin: '6px'}}>
                <Button variant="contained">Go</Button>
                </div>
                <NewEntryDialog />
            </Box>

        </React.Fragment>
    )

}