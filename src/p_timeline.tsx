import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    Unit,
    TimelineMarkers,
    TodayMarker,
    TimelineGroupBase,
    TimelineItemBase,
} from 'react-calendar-timeline'
import './p_timeline.css'
import moment from 'moment'
import { default as mock_entries } from './entries.json'
import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { delete_entry_by_id, get_entries_by_date_range, mock_get_entries_by_date_range } from './api'
import { ControlState, Employee } from './control'
import Popover from '@mui/material/Popover'
import {
    make_employee_groups,
    EntryData,
    entries_to_items,
    itemRenderer,
    generate_synthetic_items
} from './p_timeline_utils'


interface Props {
    controlState: ControlState,
    setControlState: Function,
    employees: Employee[],
}

interface State {
    visibleTimeStart: moment.Moment
    visibleTimeEnd: moment.Moment
    unit: Unit
}


export const PTimeline = (props: Props) => {

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [selectedItemId, setSelectedItemId] = React.useState(undefined as unknown as number);
    const init_groups = make_employee_groups(props.employees, props.controlState) as TimelineGroupBase[]
    const init_items = [] as TimelineItemBase<any>[]

    const unit = "week"
    const visibleTimeStart = props.controlState.date.clone()
        .startOf(unit)
    const visibleTimeEnd = props.controlState.date.clone()
        .startOf(unit)
        .add(7, "day")
    const init_state: State = {
        visibleTimeStart, visibleTimeEnd, unit
    }

    const [state, setState] = React.useState(init_state)
    const [groups, setGroups] = React.useState([...init_groups])
    const [items, setItems] = React.useState(init_items)

    useEffect(() => {

        console.log('init dates', state.visibleTimeStart.format('YYYY-MM-DD'),
         state.visibleTimeEnd.format('YYYY-MM-DD'))
        get_entries_by_date_range(
            state.visibleTimeStart.format('YYYY-MM-DD'),
            state.visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.department,
            props.controlState.location)
            .then((entries: EntryData[]) => {
                make_groups_and_items(entries)
            })

    }, [])

    useEffect(() => {

        const date = props.controlState.date.clone()
        // console.log('date has changed', date)
        const visibleTimeStart = date.clone()
            .startOf(state.unit)
        const visibleTimeEnd = date.clone()
            .startOf(state.unit)
            .add(1, state.unit)
        setState({
            ...state,
            visibleTimeStart,
            visibleTimeEnd
        })


        console.log('control state changed. dates', visibleTimeStart.format('YYYY-MM-DD'),
         visibleTimeEnd.format('YYYY-MM-DD'))

        const employeeGroups = make_employee_groups(props.employees, props.controlState)
        setGroups(employeeGroups)

        get_entries_by_date_range(
            visibleTimeStart.format('YYYY-MM-DD'),
            visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.department,
            props.controlState.location)
            .then((entries: EntryData[]) => {
                make_groups_and_items(entries)
            })
    }, [props.controlState])

    const handleTimeHeaderChange = (unit: Unit) => {
        const date = props.controlState.date.clone()
        const visibleTimeStart = date.clone().startOf(unit)
        const visibleTimeEnd = date.clone().endOf(unit)

        console.log('time header change dates', visibleTimeStart.format('YYYY-MM-DD'),
         visibleTimeEnd.format('YYYY-MM-DD'))
        setState({
            ...state,
            unit,
            visibleTimeStart,
            visibleTimeEnd
        });

        get_entries_by_date_range(
            visibleTimeStart.format('YYYY-MM-DD'),
            visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.department,
            props.controlState.location)
            .then((entries: EntryData[]) => {
                make_groups_and_items(entries)
            })
    };

    const onScrollClick = (inc: number) => {
        let newDate = props.controlState.date.clone()
            .add(inc, state.unit)
            .startOf(state.unit)
        console.log(newDate)

        props.setControlState(
            {
                ...props.controlState,
                date: newDate
            }
        )
    };

    const make_groups_and_items = (entries: EntryData[]) => {

        let newGroups = make_employee_groups(props.employees, props.controlState)
        console.log('employeGroups', newGroups, props.employees, props.controlState)
        let newItems = entries_to_items(entries)
        let syntheticItems = generate_synthetic_items(
            newGroups,
            newItems,
            state.visibleTimeStart,
            state.visibleTimeEnd
        )

        // newItems = [...newItems, ...syntheticItems]

        console.log('make_groups_and_items dates', state.visibleTimeStart.format('YYYY-MM-DD'),
         state.visibleTimeEnd.format('YYYY-MM-DD'))
        console.log('new entries', entries, 'groups', newGroups, 'items', newItems)
        setItems(newItems)
        setGroups(newGroups)
    }


    const onItemClick = (itemId: number, evt: any, time: any) => {
        const item = items.find(i => itemId === i.id)
        console.log('itemId', itemId, 'item', item)
        setSelectedItemId(itemId)
        setAnchorEl(evt.currentTarget);
    }

    const deleteSelected = () => {
        console.log('deleting item', selectedItemId)
        setAnchorEl(null);
        delete_entry_by_id(selectedItemId).then((response: any) => {
            console.log('delete response', response)
            props.setControlState(
                {
                    ...props.controlState,
                    date: moment()
                }
            )

        })
    }

    const handleTimeChange = (visibleTimeStart: number,
        visibleTimeEnd: number) => {
        const momTS = moment(visibleTimeStart)
        const momTE = moment(visibleTimeEnd)
        setState({
            ...state,
            visibleTimeStart: momTS,
            visibleTimeEnd: momTE,
        });
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };


    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div>
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
            <Button onClick={() => handleTimeHeaderChange("year")}>
                {"Yearly"}
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
                        <DateHeader />
                    </TimelineHeaders>
                    <TimelineMarkers>
                        <TodayMarker date={new Date()} />
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
                {/* <Typography sx={{ p: 2 }}>The content of the Popover.</Typography> */}
                <Button onClick={deleteSelected}>Delete</Button>
            </Popover>
        </div>
    )
}