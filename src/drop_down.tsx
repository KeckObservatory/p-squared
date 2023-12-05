import { FormControl } from '@mui/material'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
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
    tooltipObj?: { [key: string]: string }
    disabledArr?: boolean[]
    handleChange: Function
    value?: string | null
    placeholder: string
    label: string
    highlightOnEmpty?: boolean
}

const MakeMenuItem = (value: string, key: number, disabled = false, tooltip = "") => {
    return <MenuItem
        dense={true}
        disabled={disabled}
        value={value}
        key={key}
    >
        <Tooltip
            title={tooltip}
            placement={"left-start"}
        >
            <span>{value}</span>
        </Tooltip>
    </MenuItem>
}

const DropDown = (props: MenuProps): JSX.Element => {
    const value = props.value
    const errorOnEmpty = value === "" && props.highlightOnEmpty === true

    const menuItems = props.arr?.map((val, idx) => {
        const disabled = props.disabledArr ? props.disabledArr[idx] : false
        const tooltip = props.tooltipObj && (props.tooltipObj[val] ?? "")
        console.log("tooltip", tooltip)
        return MakeMenuItem(val, idx, disabled, tooltip)
    })

    const SelectInput = (
        <Select
            value={value}
            onChange={(event) => props.handleChange(event.target.value)}
            aria-label={props.label}
            label={props.label}
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