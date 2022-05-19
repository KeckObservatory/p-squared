import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    Unit,
    TimelineMarkers,
    TodayMarker,
    TimelineGroupBase,
    TimelineItemBase
} from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
// import 'react-calendar-timeline/lib/Timeline.css'
import './p_timeline.css'
import moment from 'moment'
import { default as mock_entries } from './entries.json'
import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import {get_entries_by_date_range, mock_get_entries_by_date_range } from './api'
import { ControlState } from './control'

const LOCATIONS: Array<keyof EntryData> = [
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

export type DateRange = [null | string, null | string]

export interface EntryData {
    "id": number,
    "Date": DateRange,
    "Name": string,
    "Department": string,
    "BaseCamp": string,
    "HQ": null | DateRange,
    "SU": null | DateRange,
    "HP": null | DateRange,
    "Hilo": null | DateRange,
    "Kona": null | DateRange,
    "WFH": null | DateRange,
    "Vacation": null | DateRange,
    "Sick": null | DateRange,
    "FamilySick": null | DateRange,
    "JuryDuty": null | DateRange,
    "Travel": null | DateRange,
    "Other": null | DateRange,
    "Comment": string
    "Staff": string,
    "DelFlag": number,
    "AlternatePickup": unknown,
    "SummitLead": unknown,
    "SupportLead": unknown,
    "CrewLead": unknown,
    "Seats": unknown,
    "CreationTime": string,
    "LastModification": string,
}

export interface Entry {
    "apiCode": string,
    "data": EntryData
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
        let dateRange = [moment(entry.data.Date + " 8:00:00").toISOString(),
        moment(entry.data.Date + " 17:00:00").toISOString()] as DateRange
        let title
        LOCATIONS.every((loc: keyof EntryData) => {

            const dr = entry.data[loc] as string
            if (dr !== null && dr!=="null") {
                dateRange = JSON.parse(dr) as DateRange
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

interface Props {
    controlState: ControlState,
    setControlState: Function
}

interface State {
    visibleTimeStart: moment.Moment
    visibleTimeEnd: moment.Moment
    unit: Unit
}


export const PTimeline = (props: Props) => {

    // const { groups, items } = generateFakeData(20);
    const init_groups = [] as TimelineGroupBase[]
    const init_items = [] as TimelineItemBase<any>[]
    const date = props.controlState.date.clone()

    const unit = "week"
    const visibleTimeStart = date
        .startOf(unit)
    const visibleTimeEnd = date
        .startOf(unit)
        .add(7, "day")
    const init_state: State = {
        visibleTimeStart, visibleTimeEnd, unit
    }

    const [state, setState] = React.useState(init_state)
    const [groups, setGroups] = React.useState(init_groups)
    const [items, setItems] = React.useState(init_items)


    useEffect(() => {

        const date = props.controlState.date.clone()
        const visibleTimeStart = date.clone()
            .startOf(state.unit)
        const visibleTimeEnd = date.clone()
            .startOf(state.unit)
            .add(1, state.unit)
        setState({ ...state, visibleTimeStart, visibleTimeEnd })

        get_entries_by_date_range(
            visibleTimeStart.format('YYYY-MM-DD'),
            visibleTimeEnd.format('YYYY-MM-DD'),
            props.controlState.departments,
            props.controlState.location)
            .then((entries: Entry[]) => {
                const newGroups = make_groups(entries)
                const newItems = entries_to_items(entries)
                setGroups(newGroups)
                setItems(newItems)
                // console.log('new entries', groups)
            })
    }, [props.controlState.date])

    const handleTimeHeaderChange = (unit: Unit) => {
        setState({
            ...state,
            unit: unit,
            visibleTimeStart: moment()
                .startOf(unit),
            visibleTimeEnd: moment()
                .endOf(unit)
        });
    };

    const onScrollClick = (inc: number) => {
        let newVisibleTimeStart = moment(state.visibleTimeStart)
            .add(inc, state.unit)
            .startOf(state.unit)
        let newVisibleTimeEnd = moment(state.visibleTimeStart)
            .add(inc, state.unit)
            .endOf(state.unit)
        setState({
            ...state,
            visibleTimeStart: newVisibleTimeStart,
            visibleTimeEnd: newVisibleTimeEnd
        });
    };

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
            {groups.length > 0 && (
                <Timeline
                    groups={groups}
                    items={items}
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
            )}
        </div>
    )
}