import FormControl from '@mui/material/FormControl';
import React from 'react'
import DropDown from './drop_down'
import moment from 'moment'
import { YearMonthPicker } from './year_month_picker'
import Box from '@mui/material/Box'
import { AddEditEntryDialog } from './add_edit_entry_dialog'
import Paper from '@mui/material/Paper'
import { PTimeline } from './p_timeline'
import { get_can_edit, get_employees, get_staffinfo, User } from './api'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import { ObjectParam, StringParam, useQueryParam, withDefault } from 'use-query-params';
import { AddShiftsDialog } from './add_shifts_dialog';


export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export interface Props { }

export interface ControlState {
    location: string,
    date: string
    department: string
    role: string
    nameFilter: string
    idx: number
}

export const ABV_LOCATIONS = [
    "",
    "HQ",
    "SU",
    "HP",
    "WFH",
    "Remote",
    "Leave",
    "Flex",
    "Travel",
    "NgtSup",
    "OffSite"
]

export const ALL_LOCATIONS = [
    "",
    "HQ",
    "SU",
    "HP",
    "WFH",
    "Remote",
    "Sick",
    "Vacation",
    "JuryDuty",
    "FamilySick",
    "Flex",
    "Travel",
    "NgtSup",
    "OffSite"
]

export const LOCATION_TOOLTIP: { [key: string]: string } = {
    "": "",
    "HQ": "Working at Headquarters",
    "SU": "Working at Summit",
    "HP": "Working at Hale Pohaku, not going to the Summit",
    "WFH": "Working From Home",
    "Remote": "Work at a non-home location approved by HR and your supervisor",
    "Sick": "Sick Leave",
    "Vacation": "Vacation Leave",
    "JuryDuty": "Jury Duty",
    "FamilySick": "Family Sick Leave",
    "Beraeved": "Bereavement Leave",
    "Flex": "Time off in exchange for working non-regular hours approved by supervisor",
    "Travel": "Approved business travel dates as listed on a TA form",
    "NgtSup": "Night Support",
    "OffSite": "Working at a non-Keck location, include details in notes",
}

export const REDUCED_LOCATIONS = [
    "",
    "HQ",
    "SU",
    "HP",
    "WFH",
    "Flex",
    "OffSite"
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

export const ALTERNATE_PICKUP = ['', 'HPP', 'HQ', 'Hilo', 'SJP', 'WJP'
]

export const ALTERNATE_PICKUP_TOOLTIP : { [key: string]: string} = {
    "":"",
    "HPP":"Hale Pohaku",
    "HQ":"Waimea Headquarters",
    "Hilo":"Hilo",
    "SJP":"Saddle Road Junction",
    "WJP":"Waikoloa Junction",
}

export const SUMMIT_LEAD = [ '', '7-3', '7-9', '9-5', '3-5'
]

export const SUPPORT_LEAD = ['', 'K1', 'K2', 'K1 & K2',
]

export const CREW_LEAD = [
    '0', '1'
]

export const SEATS = [
    '0', '1', '2', '3', '4', '5', '6'
]

export interface EntryState {
    baseCamp?: string,
    seats?: string,
    name?: string,
    employeeId?: string,
    department?: string,
    comment?: string,
    location: string,
    alternatePickup?: string,
    dateRange: [string | Date, string | Date],
    crewLead?: string,
    supportLead?: number,
    summitLead?: string,
    startHour: number,
    startMinutes: number,
    endHour: number,
    endMinutes: number,
    startHour2?: number,
    startMinutes2?: number,
    endHour2?: number,
    endMinutes2?: number,
    location2?: string,
    staff: string, //always the user
    alias: string, //can be another user. 
    canEdit?: boolean,
    entryId?: number,
}

export interface Employee {
    label?: string
    Alias: string,
    FirstName: string,
    LastName: string,
    EId: number,
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
        location: '',
        department: '',
        role: '',
        nameFilter: '',
        idx: 0
    }
    const [employees, setEmployees] = React.useState([] as Employee[])
    const [filtEmployees, setFiltEmployees] = React.useState([] as Employee[])
    const [departments, setDepartments] = React.useState([] as string[])
    const [roles, setRoles] = React.useState([] as string[])
    const [state, setState] = useQueryParam('controlState', withDefault(ObjectParam, initState as any))
    const [userName, setUserName] = useQueryParam('userName', withDefault(StringParam, ''))

    if (!state.date) {
        setState(
            {
                ...state,
                date: now.format(DATE_FORMAT),
            }
        )
    }

    const [entryState, setEntryState] = React.useState({
        dateRange: [now.toDate(), now.toDate()],
        startHour: 8,
        startMinutes: 0,
        endHour: 17,
        endMinutes: 0
    } as EntryState)

    React.useEffect(() => {
        const set_emp_and_user = (emps: Employee[], user: User, canEdit: boolean) => {
            if (emps.length > 0) {
                const labelEmps = emps.map((emp: Employee) => {
                    const label = `${emp.LastName}, ${emp.FirstName}`
                    return { ...emp, label: label }
                })

                const newUserName = user.LastName + ', ' + user.FirstName
                setUserName(newUserName)
                const employee = labelEmps.find((employee: Employee) => {
                    const name = employee.LastName + ', ' + employee.FirstName
                    return newUserName.includes(name)
                })
                setEmployees(labelEmps)
                setFiltEmployees(labelEmps)
                const newState = {
                    ...entryState,
                    name: newUserName,
                    staff: user.Alias,
                    employeeId: employee ? String(employee.EId).padStart(4, '0') : undefined,
                    department: user.Department,
                    baseCamp: user.BaseCamp,
                    canEdit: canEdit
                }
                console.log('state init to...', newState)
                setEntryState(
                    newState
                )
            }
        }

        const init_employees = async () => {
            console.log('init employees')
            const user = await get_staffinfo()
            //@ts-ignore
            if ((user).status === 'ERROR' || user.Alias === undefined) {
                window.location.reload();
            }
            const canEdit = Boolean(await get_can_edit(user.Alias))
            let emps = await get_employees()
            console.log('emps', emps)
            if (emps.length === 0 || emps === undefined) {
                throw new Error('No employees found')
            }
            let empDeps = emps.map((emp: Employee) => { return emp.Department })
            let roleArr = emps.map((emp: Employee) => { return emp.Role.split(',') })
            let roles: string[] = []
            roleArr.forEach((arr: string[]) => {
                arr.forEach((role: string) => {
                    roles.push(role.trim())
                })
            })
            setRoles(Array.from(new Set(["", ...roles.sort()])))
            let dpnts = Array.from(new Set(empDeps))
            dpnts = ["", ...dpnts.sort()]
            setDepartments(dpnts)
            console.log('canEdit', canEdit)
            set_emp_and_user(emps, user, canEdit)
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

    const handleRoleChange = (role: string) => {
        setState({
            ...state,
            role: role
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
        console.log('submitting entry')
        setState({
            ...state,
            idx: state.idx + 1
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
            <Paper sx={{ margin: '4px', paddingTop: '2px' }} elevation={3}>
                <Box sx={{ marginTop: '16px' }}
                >
                    <FormControl sx={{ width: 150, margin: '6px', marginTop: '12px' }}>
                        <YearMonthPicker date={moment(state.date, DATE_FORMAT)} handleDateChange={handleDateChange} />
                    </FormControl>
                    <FormControl aria-label='location' sx={{ width: 100, margin: '6px', marginTop: '6px' }}>
                        <DropDown
                            aria-label='location'
                            arr={ABV_LOCATIONS}
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
                    <FormControl sx={{ minWidth: 150, marginLeft: '20px', marginTop: '6px' }}>
                        <DropDown arr={roles}
                            handleChange={handleRoleChange}
                            value={state.role}
                            placeholder={'Select Role'}
                            label={'Roles'}
                        />
                    </FormControl>
                    <FormControl sx={{ width: 250, marginLeft: '26px', marginTop: '12px' }}>
                        <Autocomplete
                            freeSolo
                            disablePortal
                            id="employee-filter-box"
                            options={employees}
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
                        edit={false}
                        entryState={entryState}
                        setEntryState={setEntryState}
                        handleEntrySubmit={handleEntrySubmit} />
                    {entryState.canEdit && (
                        <AddShiftsDialog
                            staff={entryState.staff}
                            employees={employees}
                            roles={roles}
                            handleEntrySubmit={handleEntrySubmit}
                        />
                    )
                    }
                </Box>
                {filtEmployees.length > 0 ? (
                    < PTimeline
                        name={entryState.name}
                        canEdit={entryState.canEdit}
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