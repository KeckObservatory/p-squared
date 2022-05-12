import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 0;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const departments = [
    'All',
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
    'Council'
];

export default function DepartmentSelect() {
    const [departmentName, setDepartmentName] = React.useState<string[]>([]);

    const handleChange = (event: SelectChangeEvent<typeof departmentName>) => {
        const {
            target: { value },
        } = event;
        console.log('value', value, 'departmentName', departmentName)
        const allSelected = departmentName.indexOf('All') === -1 && value.indexOf('All') > -1
        const allUnselected = departmentName.indexOf('All') > - 1 && value.indexOf('All') === -1
        if (allSelected) {
            console.log('setting All selected')
            setDepartmentName(departments)
        }
        else if (allUnselected) {
            setDepartmentName([])
        }
        else {
            setDepartmentName(
                // On autofill we get a stringified value.
                typeof value === 'string' ? value.split(',') : value,
            );
        }
    };

    return (
        <React.Fragment>
            <InputLabel id="multiple-departments-label">Departments</InputLabel>
            <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={departmentName}
                onChange={handleChange}
                input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
            >
                {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                        <Checkbox checked={departmentName.indexOf(dept) > -1} />
                        <ListItemText primary={dept} />
                    </MenuItem>
                ))}
            </Select>
        </React.Fragment >
    );
}