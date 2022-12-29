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
import { edit_entry_by_id, delete_entry_by_id, get_entries_by_date_range, get_holidays } from './api'
import { ControlState, Employee, EntryState } from './control'
import Popover from '@mui/material/Popover'
import Paper from '@mui/material/Paper'
import {
    make_employee_groups,
    EntryData,
    entries_to_items,
    itemRenderer,
    generate_synthetic_items,
    Item,
    filter_groups_by_location,
    label_format,
    generate_holiday_items
} from './p_timeline_utils'
import { AddEditEntryDialog } from './add_edit_entry_dialog'


interface Props {
    controlState: ControlState,
    setControlState: Function,
    employees: Employee[],
    entryState: EntryState
    setEntryState: Function,
    handleEntrySubmit: Function
}

interface State {
    visibleTimeStart: moment.Moment
    visibleTimeEnd: moment.Moment
    unit: Unit
}


export const PTimeline = (props: Props) => {

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [selectedItem, setSelectedItem] = React.useState(undefined as unknown as Item);

    const [selectedComment, setSelectedComment] = React.useState('');
    const init_groups = make_employee_groups(props.employees, props.controlState) as TimelineGroupBase[]
    const init_items = [] as TimelineItemBase<any>[]

    const initUnit = "week"
    const initVisibleTimeStart = props.controlState.date.clone()
        .startOf(initUnit)
    const initVisibleTimeEnd = props.controlState.date.clone()
        .startOf(initUnit)
        .add(7, "day")
    const init_state: State = {
        visibleTimeStart: initVisibleTimeStart,
        visibleTimeEnd: initVisibleTimeEnd,
        unit: initUnit
    }


    const localDate = new Date()
    const HIdate = new Date(localDate.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }))

    const [state, setState] = React.useState(init_state)
    const [groups, setGroups] = React.useState([...init_groups])
    const [items, setItems] = React.useState(init_items)

    useEffect(() => {

        const init_handler = async () => {

            const entries = await get_entries_by_date_range(
                state.visibleTimeStart.format('YYYY-MM-DD'),
                state.visibleTimeEnd.format('YYYY-MM-DD'),
                props.controlState.department,
                props.controlState.location)
            const holidays = await get_holidays(
                state.visibleTimeStart.format('YYYY-MM-DD'),
                state.visibleTimeEnd.format('YYYY-MM-DD'),
            )
            make_groups_and_items(entries,
                state.visibleTimeStart, state.visibleTimeEnd, holidays.holidays)
        }

    }, [])

    useEffect(() => {

        const control_state_change_handler = async () => {


            const date = props.controlState.date.clone()
            // console.log('date has changed', date)
            const visibleTimeStart = date.clone()
                .startOf(state.unit)
            const visibleTimeEnd = date.clone()
                .startOf(state.unit as any)
                .add(1, state.unit as any)
            setState({
                ...state,
                visibleTimeStart,
                visibleTimeEnd
            })


            console.log('control state changed. dates', visibleTimeStart.format('YYYY-MM-DD'),
                visibleTimeEnd.format('YYYY-MM-DD'))

            const employeeGroups = make_employee_groups(props.employees, props.controlState)
            setGroups(employeeGroups)

            const entries = await get_entries_by_date_range(
                visibleTimeStart.format('YYYY-MM-DD'),
                visibleTimeEnd.format('YYYY-MM-DD'),
                props.controlState.department,
                props.controlState.location)

            const holidays = await get_holidays(
                state.visibleTimeStart.format('YYYY-MM-DD'),
                state.visibleTimeEnd.format('YYYY-MM-DD'),
            )
            make_groups_and_items(entries,
                state.visibleTimeStart, state.visibleTimeEnd, holidays.holidays)
        }

        control_state_change_handler()
    }, [props.controlState])

    const handleTimeHeaderChange = async (unit: Unit) => {
        const date = props.controlState.date.clone()
        const visibleTimeStart = date.clone().startOf(unit)
        const visibleTimeEnd = date.clone().endOf(unit)

        setState({
            ...state,
            unit,
            visibleTimeStart,
            visibleTimeEnd
        });

        const entries = await get_entries_by_date_range(
            visibleTimeStart.format('YYYY-MM-DD'),
            visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.department,
            props.controlState.location)

        const holidays = await get_holidays(
            state.visibleTimeStart.format('YYYY-MM-DD'),
            state.visibleTimeEnd.format('YYYY-MM-DD'),
        )
        make_groups_and_items(entries,
            state.visibleTimeStart, state.visibleTimeEnd, holidays.holidays)
    };

    const onScrollClick = (inc: number) => {
        let newDate = props.controlState.date.clone()
            .add(inc, state.unit as any)
            .startOf(state.unit as any)
        console.log(newDate)

        props.setControlState(
            {
                ...props.controlState,
                date: newDate
            }
        )
    };

    const make_groups_and_items = (entries: EntryData[],
        visibleTimeStart: moment.Moment, visibleTimeEnd: moment.Moment, holidays: string[]
    ) => {

        let newGroups = make_employee_groups(props.employees, props.controlState)
        console.log('employeGroups', newGroups, props.employees, props.controlState)
        let newItems = entries_to_items(entries)
        const locationFiltering = props.controlState.location !== ""
        newGroups = locationFiltering ? filter_groups_by_location(newGroups, newItems) : newGroups

        let holidayItems = generate_holiday_items( //holiday come before synthetic items
            newGroups,
            newItems,
            holidays,
        )

        newItems = [...newItems, ...holidayItems]

        let syntheticItems = generate_synthetic_items(
            newGroups,
            newItems,
            visibleTimeStart.clone(),
            visibleTimeEnd.clone()
        )

        newItems = [...newItems, ...syntheticItems]


        console.log('make_groups_and_items dates', visibleTimeStart.format('YYYY-MM-DD'),
            visibleTimeEnd.format('YYYY-MM-DD'))
        const startIdx = moment().valueOf()
        for (let idx = 0; idx < newItems.length; idx++) { //ensure idx are all unique
            newItems[idx]['id'] = idx + startIdx
        }

        console.log('new entries', entries, 'groups', newGroups, 'items', newItems)
        setItems(newItems)
        setGroups(newGroups)
    }


    const onItemClick = (itemId: number, evt: any, time: any) => {
        const item = items.find(i => itemId === i.id) as Item
        console.log('itemId', itemId, 'item', item, evt, time)
        setSelectedItem(item)
        setSelectedComment(item.comment ? item.comment : '')

        const matches_name = props.entryState.name === item.group
        console.log('matches_name', matches_name)
        if (matches_name || props.entryState.admin) {
            setAnchorEl(evt.currentTarget);
            props.setEntryState(
                {
                    ...props.entryState,
                    name: item.group,
                    comment: item.comment,
                    location: item.location,
                    startTime: item.start_time.hour(),
                    endTime: item.end_time.hour(),
                    dateRange: [item.start_time, item.end_time],
                    entryId: item.entryId

                }
            )
        }
    }

    const deleteSelected = () => {
        setAnchorEl(null);
        if (!selectedComment.includes('synthetic event')) {
            console.log('deleting item', selectedItem.entryId)
            delete_entry_by_id(selectedItem.entryId).then((response: any) => {
                console.log('delete response', response)
                props.setControlState((pcs: ControlState) => {
                    return { ...pcs, idx: pcs.idx + 1 }
                })
            })
        }
    }

    const handleTimeChange = (visibleTimeStart: number,
        visibleTimeEnd: number,
        updateScrollCanvas: (start: number, end: number) => void) => {
        //disable scrolling
        updateScrollCanvas(state.visibleTimeStart.valueOf(), state.visibleTimeEnd.valueOf())
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

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
                    visibleTimeStart={state.visibleTimeStart}
                    visibleTimeEnd={state.visibleTimeEnd}
                    itemRenderer={itemRenderer}
                    onTimeChange={handleTimeChange}
                    onItemSelect={onItemClick}
                    onItemClick={onItemClick}
                >
                    <TimelineHeaders className="sticky">
                        <SidebarHeader >
                            {({ getRootProps }) => {
                                return <div className="names" {...getRootProps()}>Names</div>
                            }}
                        </SidebarHeader>
                        <DateHeader unit="primaryHeader" />
                        <DateHeader labelFormat={label_format} />
                    </TimelineHeaders>
                    <TimelineMarkers>
                        <CustomMarker date={HIdate} />
                    </TimelineMarkers>
                </Timeline>
            )}
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Button style={{ margin: '12px' }} variant="contained" onClick={deleteSelected}>Delete</Button>
                <AddEditEntryDialog
                    employees={props.employees}
                    entryState={props.entryState}
                    setEntryState={props.setEntryState}
                    edit={true}
                    handleEntrySubmit={props.handleEntrySubmit}
                    handleClosePopover={handleClosePopover}
                />
            </Popover>
        </Paper>
    )
}