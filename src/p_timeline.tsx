import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    Unit,
    TimelineMarkers,
    TodayMarker
} from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
// import 'react-calendar-timeline/lib/Timeline.css'
import './p_timeline.css'
import moment from 'moment'
import { default as mock_entries } from './entries.json'
import React from 'react'
import Button from '@mui/material/Button'

const LOCATIONS = [
    "HQ",
    "SU",
    "HP",
    "Hilo",
    "Kona",
    "WFH",
    "Vacation",
    "Sick",
    "FamilySick",
    "JuryDuty",
    "Travel",
    "Other",
]

export interface Entry {
    [key: string]: any
}

const make_groups = (entries: Entry[]) => {
    const names = entries.map((entry: Entry) => {
        return entry.data.Name
    })
    const uNames = new Set(names)
    const groups = Array.from(uNames).map((name: string, idx) => {
        const group = { id: idx, title: name }
        return group
    })

    return groups
}

const entries_to_items = (entries: Entry[]) => {

    const items = entries.map((entry: Entry, idx) => {
        let dateRange = [moment(entry.data.Date + " 8:00:00"),
        moment(entry.data.Date + " 17:00:00")]
        let title
        LOCATIONS.every((loc: string) => {
            if (entry.data[loc]) {
                dateRange = entry.data[loc]
                title = loc
                return false
            }
            return true
        })
        const item = {
            id: idx,
            // group: entry.data.Name,
            group: idx,
            title: title,
            start_time: moment(dateRange[0]),
            end_time: moment(dateRange[1])
        }
        return item
    })

    return items
}

interface State {
    groups: object[]
    items: object[]
    visibleTimeStart: number
    visibleTimeEnd: number
    unit: Unit
}

export const PTimeline = () => {

    // const { groups, items } = generateFakeData(20);
    const groups = make_groups(mock_entries)
    const items = entries_to_items(mock_entries)
    const unit = "week"
    const visibleTimeStart = moment()
        .startOf(unit)
        .valueOf();
    const visibleTimeEnd = moment()
        .startOf(unit)
        .add(7, "day")
        .valueOf();
    const init_state: State = {
        groups, items, visibleTimeStart, visibleTimeEnd, unit
    }
    const [state, setState] = React.useState(init_state)
    // console.log(groups, items)

    const handleTimeHeaderChange = (unit: Unit) => {
        setState({
            ...state,
            unit: unit,
            visibleTimeStart: moment()
                .startOf(unit)
                .valueOf(),
            visibleTimeEnd: moment()
                .endOf(unit)
                .valueOf(),
        });
    };

    const onScrollClick = (inc: number) => {
        let newVisibleTimeStart = moment(state.visibleTimeStart)
            .add(inc, state.unit)
            .startOf(state.unit)
            .valueOf();
        let newVisibleTimeEnd = moment(state.visibleTimeStart)
            .add(inc, state.unit)
            .endOf(state.unit)
            .valueOf();
        setState({
            ...state,
            visibleTimeStart: newVisibleTimeStart,
            visibleTimeEnd: newVisibleTimeEnd
        });
    };

    const handleTimeChange = (visibleTimeStart: number,
        visibleTimeEnd: number) => {
        setState({
            ...state,
            visibleTimeStart,
            visibleTimeEnd,
        });
    };


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
            <Timeline
                groups={groups}
                items={items}
                // defaultTimeStart={moment().add(-12, 'hour')}
                // defaultTimeEnd={moment().add(12, 'hour')}
                // rightSidebarWidth={150}
                stackItems
                itemHeightRatio={0.85}
                canMove={false}
                canResize={false}
                visibleTimeStart={state.visibleTimeStart}
                visibleTimeEnd={state.visibleTimeEnd}
                onTimeChange={handleTimeChange}
            >
                <TimelineHeaders>
                    <SidebarHeader >
                        {({ getRootProps }) => {
                            return <div {...getRootProps()}>Names</div>
                        }}
                    </SidebarHeader>
                    <DateHeader unit="primaryHeader" />
                    <DateHeader />
                </TimelineHeaders>
                <TimelineMarkers>
                    <TodayMarker date={new Date()} />
                </TimelineMarkers>
            </Timeline>
        </div>
    )
}