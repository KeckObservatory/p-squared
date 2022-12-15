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
import { default as mock_entries } from './entries.json'
import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import { delete_entry_by_id, get_entries_by_date_range, mock_get_entries_by_date_range } from './api'
import { ControlState, Employee } from './control'
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
    label_format
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
    const [selectedName, setSelectedName] = React.useState("");

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
    const HIdate = new Date( localDate.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' } ) )

    const [state, setState] = React.useState(init_state)
    const [groups, setGroups] = React.useState([...init_groups])
    const [items, setItems] = React.useState(init_items)

    useEffect(() => {
        get_entries_by_date_range(
            state.visibleTimeStart.format('YYYY-MM-DD'),
            state.visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.department,
            props.controlState.location)
            .then((entries: EntryData[]) => {
                make_groups_and_items(entries,
                    state.visibleTimeStart, state.visibleTimeEnd)
            })

    }, [])

    useEffect(() => {

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

        get_entries_by_date_range(
            visibleTimeStart.format('YYYY-MM-DD'),
            visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.department,
            props.controlState.location)
            .then((entries: EntryData[]) => {
                make_groups_and_items(entries,
                    visibleTimeStart, visibleTimeEnd)
            })
    }, [props.controlState])

    const handleTimeHeaderChange = (unit: Unit) => {
        const date = props.controlState.date.clone()
        const visibleTimeStart = date.clone().startOf(unit)
        const visibleTimeEnd = date.clone().endOf(unit)

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
                make_groups_and_items(entries,
                    visibleTimeStart, visibleTimeEnd)
            })
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
        visibleTimeStart: moment.Moment, visibleTimeEnd: moment.Moment
    ) => {

        let newGroups = make_employee_groups(props.employees, props.controlState)
        console.log('employeGroups', newGroups, props.employees, props.controlState)
        let newItems = entries_to_items(entries)
        const locationFiltering = props.controlState.location !== ""
        newGroups = locationFiltering ? filter_groups_by_location(newGroups, newItems) : newGroups

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
        setSelectedItemId(item.entryId)
        setSelectedComment(item.comment ? item.comment : '')
        setAnchorEl(evt.currentTarget);
    }

    const deleteSelected = () => {
        setAnchorEl(null);
        if (!selectedComment.includes('synthetic event')) {
            console.log('deleting item', selectedItemId)
            delete_entry_by_id(selectedItemId).then((response: any) => {
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
                        <CustomMarker date={ HIdate } />
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
                <Button onClick={deleteSelected}>Delete</Button>
            </Popover>
        </Paper>
    )
}