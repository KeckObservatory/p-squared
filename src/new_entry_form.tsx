import React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DropDown from './drop_down';
import MyDateRangePicker from './date_range_picker'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Typography } from "@mui/material";
import { LOCATIONS } from './control'



interface Props {

}

const pickupLocs = [
    "HP",
    "HQ",
    "Hilo",
    "SJP",
    "WJP",
]

const additionalSeats = [
    "1", "2", "3", "4", "5", "6"
]

const baseCamp = [
    "Waimea", "Hilo"
]

export const NewEntryForm = (props: Props) => {

    const handlePickupChange = () => {

    }


    const handleLocationChange = () => {

    }

    const handleBasecampChange = () => {

    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                '& .MuiTextField-root': { width: '25ch' },
            }}
        >
            <TextField label={'Last Name'} id="last-name" />
            <TextField label={'Dept'} disabled id="dept" margin="dense" />
            <DropDown arr={baseCamp}
                handleChange={handleBasecampChange}
                label={'Base Camp'}
                placeholder={""}
            />
            <DropDown arr={pickupLocs}
                handleChange={handlePickupChange}
                label={'Alternative Pickup'}
                placeholder={""}
            />
            <MyDateRangePicker />
            <DropDown arr={LOCATIONS}
                handleChange={handleLocationChange}
                label={'Location'}
                placeholder={""}
            />
            <Typography>Summit Lead</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="7-3" control={<Radio />} label="7-3" />
                <FormControlLabel value="7-9" control={<Radio />} label="7-9" />
                <FormControlLabel value="9-5" control={<Radio />} label="9-5" />
                <FormControlLabel value="3-5" control={<Radio />} label="3-5" />
            </RadioGroup>
            <Typography>Summit Support Lead</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="K1" control={<Radio />} label="K1" />
                <FormControlLabel value="K2" control={<Radio />} label="K2" />
                <FormControlLabel value="K1+K2" control={<Radio />} label="K1+K2" />
            </RadioGroup>
            <Typography>Crew Send</Typography>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
            >
                <FormControlLabel value="No" control={<Radio />} label="No" />
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            </RadioGroup>
            <DropDown arr={additionalSeats}
                handleChange={handlePickupChange}
                label={'Additional Seats'}
                placeholder={""}
            />
            <TextField disabled label={'Staff'} id="staff" />
            <TextField label={'Note'} id="note" />
        </Box>

    );
}
