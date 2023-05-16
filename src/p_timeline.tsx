import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    Unit,
    TimelineMarkers,
    CustomMarker,
    TimelineGroupBase,
    TimelineItemBase,
} from 'react-calendar-timeline'
import './p_timeline.css'
import moment from 'moment'
import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import { delete_entry_by_id, get_entries_by_date_range, get_holidays } from './api'
import { ControlState, Employee, EntryState, DATE_FORMAT } from './control'
import Paper from '@mui/material/Paper'
import {
    make_employee_groups,
    EntryData,
    entries_to_items,
    itemRenderer,
    Item,
    filter_groups_by_location,
    label_format,
    generate_holiday_items
} from './p_timeline_utils'
import { AddEditEntryDialog } from './add_edit_entry_dialog'
import { ObjectParam, useQueryParam, withDefault } from "use-query-params"
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'

interface Props {
    controlState: ControlState,
    setControlState: Function,
    entryState: EntryState,
    employees: Employee[],
    name?: string,
    canEdit?: boolean
    setEntryState: Function,
    handleEntrySubmit: () => Promise<void>
}

interface State {
    visibleTimeStart: string
    visibleTimeEnd: string
    unit: Unit
}


export const PTimeline = (props: Props) => {

    const [selectedItem, setSelectedItem] = React.useState(undefined as unknown as Item);

    const [open, setOpen] = React.useState(false)
    const init_groups = make_employee_groups(props.employees,
        props.controlState.department,
        props.controlState.role) as TimelineGroupBase[]
    const init_items = [] as TimelineItemBase<any>[]

    const initUnit = "week"
    const initVisibleTimeStart = moment(props.controlState.date, DATE_FORMAT)
        .startOf(initUnit)
    const initVisibleTimeEnd = moment(props.controlState.date, DATE_FORMAT)
        .startOf(initUnit).add(1, initUnit)

    const init_state: State = {
        visibleTimeStart: initVisibleTimeStart.format(DATE_FORMAT),
        visibleTimeEnd: initVisibleTimeEnd.format(DATE_FORMAT),
        unit: initUnit
    }

    const localDate = new Date()
    const HIdate = new Date(localDate.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }))
    const [state, setState] = useQueryParam('state', withDefault(ObjectParam, init_state as any))
    const [groups, setGroups] = React.useState([...init_groups])
    const [items, setItems] = React.useState(init_items)

    useEffect(() => {

        const control_state_change_handler = async () => {
            const date = moment(props.controlState.date, DATE_FORMAT)
            const visibleTimeStart = date.clone()
                .startOf(state.unit)
            const visibleTimeEnd = date.clone()
                .startOf(state.unit as any)
                .add(1, state.unit as any)

            if (state.unit === 'week') {
                visibleTimeStart.add(1, "day")
                visibleTimeEnd.add(1, "day")
            }
            setState({
                ...state,
                visibleTimeStart: visibleTimeStart.format(DATE_FORMAT),
                visibleTimeEnd: visibleTimeEnd.format(DATE_FORMAT)
            })
            console.log('control state changed. dates', visibleTimeStart.format(DATE_FORMAT),
                visibleTimeEnd.format(DATE_FORMAT))
            const entries = await get_entries_by_date_range(
                visibleTimeStart.format(DATE_FORMAT),
                visibleTimeEnd.format(DATE_FORMAT),
                props.controlState.department,
                props.controlState.location)

            const holidays = await get_holidays(
                visibleTimeStart.format(DATE_FORMAT),
                visibleTimeEnd.format(DATE_FORMAT),
            )
            make_groups_and_items(entries,
                visibleTimeStart, visibleTimeEnd, holidays)
        }

        control_state_change_handler()
    }, [props.controlState.date,
    props.controlState.department,
    props.controlState.role,
    props.controlState.location,
    props.controlState.idx,
    state.unit,
    props.controlState.nameFilter])

    const handleTimeHeaderChange = async (unit: Unit) => {
        console.log('handleTimeHeaderChange selected', unit)
        const date = moment(props.controlState.date, DATE_FORMAT)
        const visibleTimeStart = date.clone().startOf(unit)
        const visibleTimeEnd = date.clone().endOf(unit)

        setState({
            ...state,
            unit,
            visibleTimeStart: visibleTimeStart.format(DATE_FORMAT),
            visibleTimeEnd: visibleTimeEnd.format(DATE_FORMAT)
        });

        const entries = await get_entries_by_date_range(
            visibleTimeStart.format(DATE_FORMAT),
            visibleTimeEnd.format(DATE_FORMAT),
            props.controlState.department,
            props.controlState.location)

        const holidays = await get_holidays(
            visibleTimeStart.format(DATE_FORMAT),
            visibleTimeEnd.format(DATE_FORMAT),
        )
        make_groups_and_items(entries,
            visibleTimeStart, visibleTimeEnd, holidays)
    };

    const onScrollClick = (inc: number) => {
        let newDate = moment(props.controlState.date, DATE_FORMAT)

        newDate.add(inc, state.unit as any)
            .startOf(state.unit as any)
        console.log(newDate)

        props.setControlState(
            {
                ...props.controlState,
                date: newDate.format(DATE_FORMAT)
            }
        )
    };

    const make_groups_and_items = (entries: EntryData[],
        visibleTimeStart: moment.Moment,
        visibleTimeEnd: moment.Moment,
        holidays: string[]
    ) => {

        let newGroups = make_employee_groups(props.employees,
            props.controlState.department,
            props.controlState.role)
        let newItems = entries_to_items(entries)
        const locationFiltering = props.controlState.location !== ""
        newGroups = locationFiltering ? filter_groups_by_location(newGroups, newItems) : newGroups

        let holidayItems = generate_holiday_items( //holiday come before synthetic items
            newGroups,
            newItems,
            holidays,
        )

        newItems = [...newItems, ...holidayItems]

        console.log('make_groups_and_items dates', visibleTimeStart.format(DATE_FORMAT),
            visibleTimeEnd.format(DATE_FORMAT))
        const startIdx = moment().valueOf()
        for (let idx = 0; idx < newItems.length; idx++) { //ensure idx are all unique
            newItems[idx]['id'] = idx + startIdx

            if (state.unit.includes('month')) { //month items are a full day
                const start_actual_time = newItems[idx].start_time.clone()
                const end_actual_time = newItems[idx].end_time.clone()
                newItems[idx].start_time.startOf('day')
                newItems[idx].end_time.endOf('day')
                newItems[idx] = { ...newItems[idx], start_actual_time, end_actual_time } as Item
            }
        }

        console.log('new entries', entries, 'groups', newGroups, 'items', newItems)
        setItems(newItems)
        setGroups(newGroups)
    }

    const onItemClick = (itemId: number, evt: any, time: any) => {
        const item = items.find(i => itemId === i.id) as Item
        const matches_name = props.name === item.group
        const employee = props.employees.find((employee: Employee) => {
            const name = employee.LastName + ', ' + employee.FirstName
            return item.group.includes(name)
        })
        if (matches_name || props.canEdit) {
            setOpen(true)
            console.log('itemId', itemId, 'item', item, evt, time)
            setSelectedItem(item)

            const st = item.start_actual_time ? item.start_actual_time : item.start_time
            const et = item.end_actual_time ? item.end_actual_time : item.end_time
            props.setEntryState((entryState: EntryState) => {
                return ({
                    ...entryState,
                    name: item.group,
                    alias: employee?.Alias,
                    employeeId: employee ? employee.EId : undefined,
                    comment: item.comment,
                    location: item.location,
                    department: item.department ? item.department : entryState.department,
                    baseCamp: item.baseCamp ? item.baseCamp : entryState.baseCamp,
                    startTime: st.hour(),
                    endTime: et.hour(),
                    dateRange: [item.start_time, item.end_time],
                    entryId: item.entryId
                })
            }
            )

        }
    }

    const deleteSelected = () => {
        setOpen(false)
        console.log('deleting item', selectedItem.entryId)
        delete_entry_by_id(selectedItem.entryId).then(async (response: any) => {
            console.log('delete response', response)
            await new Promise(resolve => setTimeout(resolve, 500)); // wait for backend to update 
            props.setControlState((pcs: ControlState) => {
                return { ...pcs, idx: pcs.idx + 1 }
            })
        })
    }

    const handleTimeChange = (visibleTimeStart: number,
        visibleTimeEnd: number,
        updateScrollCanvas: (start: number, end: number) => void) => {
        //disable scrolling
        updateScrollCanvas(moment(state.visibleTimeStart, DATE_FORMAT).valueOf(), moment(state.visibleTimeEnd, DATE_FORMAT).valueOf())
    };

    const handleCloseDialog = () => {
        setOpen(false)
    };

    return (
        <Paper sx={{ marginTop: '12px', margin: '4px' }} elevation={3}>
            <Button onClick={() => onScrollClick(-1)}>{"< Prev"}</Button>
            <Button onClick={() => onScrollClick(1)}>{"Next >"}</Button>
            <Button onClick={() => handleTimeHeaderChange("day")}>
                {"Daily"}
            </Button>
            <Button onClick={() => handleTimeHeaderChange("week")}>
                {"Weekly"}
            </Button>
            <Button onClick={() => handleTimeHeaderChange("month")}>
                {"Monthly"}
            </Button>
            {groups.length >= 0 && (
                <Timeline
                    groups={groups}
                    items={items as any[]}
                    stackItems
                    itemHeightRatio={0.85}
                    canMove={false}
                    canResize={false}
                    minZoom={moment(state.visibleTimeStart, DATE_FORMAT).valueOf()}
                    maxZoom={moment(state.visibleTimeEnd, DATE_FORMAT).valueOf()}
                    visibleTimeStart={moment(state.visibleTimeStart, DATE_FORMAT).valueOf()}
                    visibleTimeEnd={moment(state.visibleTimeEnd, DATE_FORMAT).valueOf()}
                    itemRenderer={itemRenderer}
                    onTimeChange={handleTimeChange}
                    onItemSelect={onItemClick}
                    buffer={1}
                    onItemClick={onItemClick}
                >
                    <TimelineHeaders className="sticky">
                        <SidebarHeader >
                            {({ getRootProps }) => {
                                return <div className="names" {...getRootProps()}>Employees</div>
                            }}
                        </SidebarHeader>
                        <DateHeader unit={'primaryHeader'} />
                        <DateHeader labelFormat={label_format} />
                    </TimelineHeaders>
                    <TimelineMarkers>
                        <CustomMarker date={HIdate}>
                            {({ styles, date }) => {
                                const customStyles = {
                                    ...styles,
                                    backgroundColor: 'deeppink',
                                    width: '12px'
                                }
                                return <div style={customStyles} />
                            }}
                        </CustomMarker>
                    </TimelineMarkers>
                </Timeline>
            )}
            <Dialog onClose={handleCloseDialog} open={open}>
                <DialogTitle>Edit/Delete Entry</DialogTitle>
                <Button style={{ margin: '12px' }}
                    variant="contained"
                    onClick={deleteSelected}
                >
                    Delete
                </Button>
                <AddEditEntryDialog
                    employees={props.employees}
                    entryState={props.entryState}
                    setEntryState={props.setEntryState}
                    edit={true}
                    handleEntrySubmit={props.handleEntrySubmit}
                    handleCloseDialog={handleCloseDialog}
                />
            </Dialog>
        </Paper>
    )
}