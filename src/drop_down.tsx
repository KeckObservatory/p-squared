import { FormControl } from '@mui/material'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

export const formControlStyle = {
    minWidth: 120,
    width: '100%',
    margin: '6px',
    display: 'flex',
    flexWrap: 'wrap',
}


interface MenuProps {
    arr: string[] | undefined
    disabledArr?: boolean[]
    handleChange: Function
    value?: string | null
    placeholder: string
    label: string
    highlightOnEmpty?: boolean
}

const MakeMenuItem = (value: string, key: number, disabled = false) => {
    return <MenuItem dense={true} disabled={disabled} value={value} key={key}>{value}</MenuItem>
}

const DropDown = (props: MenuProps): JSX.Element => {
    const value = props.value
    const errorOnEmpty = value === "" && props.highlightOnEmpty === true

    const menuItems = props.arr?.map((x, idx) => {
        const disabled = props.disabledArr ? props.disabledArr[idx] : false
        return MakeMenuItem(x, idx, disabled)
    })

    const SelectInput = (
        <Select
            value={value}
            onChange={(event) => props.handleChange(event.target.value)}
            label={props.placeholder}
            >
            <MenuItem disabled value="">
                <em>{props.placeholder}</em>
            </MenuItem>
            {menuItems}
        </Select>
    )

    if (errorOnEmpty) {
        return (
            <FormControl error sx={formControlStyle} >
                <InputLabel id="error-select-label" > {props.label}</InputLabel >
                {SelectInput}
            </FormControl >
        )
    }
    else {
        return (
            <FormControl sx={formControlStyle} >
                <InputLabel id="select-label">{props.label}</InputLabel>
                {SelectInput}
            </FormControl>
        )
    }
}

DropDown.defaultProps = {
    highlightOnEmpty: false,
    value: ""
}

export default DropDown