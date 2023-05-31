import moment from 'moment'
import { ReactCalendarItemRendererProps, LabelFormat } from 'react-calendar-timeline'
import { ControlState, Employee } from './control'
import Tooltip from '@mui/material/Tooltip';
import { ALL_LOCATIONS } from './control';
import React from 'react';

const colorMapping = {
    orange: '#e69f00',
    blue: '#56b4e9',
    green: '#009e73',
    pink: '#cc79a7',
    yellow: '#f0e442',
    darkBlue: '#1976d2',
    darkOrange: '#d55e00',
    white: '#FFFFFF',
    black: '#000000',
    gold: '#D4AF37'
}

const get_location_color = (location: string) => {
    let color: string
    let fontColor = colorMapping['white']
    switch (location) {
        case "HQ":
            color = 'darkBlue'
            break;
        case "SU":
        case "HP":
        case "Hilo":
        case "Kona":
            color = colorMapping['gold']
            fontColor = colorMapping['black']
            break;
        case "WFH":
        case "Remote":
            color = colorMapping['pink']
            break;
        case "Vacation":
        case "Leave":
        case "Sick":
        case "FamilySick":
        case "Sick":
        case "JuryDuty":
        case "Holiday":
            color = colorMapping['green']
            break;
        case "Travel":
            color = colorMapping['blue']
            fontColor = colorMapping['black']
            break;
        case "other":
            color = colorMapping['orange']
            break;
        case "flex":
            color = colorMapping['darkBlue']
            break;
        default:
            color = colorMapping['darkBlue']
    }
    return [color, fontColor]

}

export type DateRange = [null | string, null | string]

export interface EntryData {
    "id": number,
    "Date": string | DateRange,
    "Name": string,
    "Alias": string
    "Department": string,
    "BaseCamp": string,
    "HQ": null | DateRange,
    "SU": null | DateRange,
    "HP": null | DateRange,
    "Hilo": null | DateRange,
    "Kona": null | DateRange,
    "WFH": null | DateRange,
    "Remote": null | DateRange,
    "Vacation": null | DateRange,
    "Sick": null | DateRange,
    "FamilySick": null | DateRange,
    "JuryDuty": null | DateRange,
    "Travel": null | DateRange,
    "Other": null | DateRange,
    "Comment": string,
    "Staff": string,
    "DelFlag": number,
    "AlternatePickup": string,
    "SummitLead": string,
    "SupportLead": string,
    "CrewLead": string,
    "Seats": string,
    "CreationTime": string,
    "LastModification": string,
}

export interface Item {
    id: string | number,
    group: string,
    title: string,
    department?: string,
    baseCamp?: string,
    entryId: number,
    location: string,
    alias: string,
    comment?: string,
    bgColor?: string,
    selectedBgColor?: string,
    color?: string,
    start_time: moment.Moment,
    end_time: moment.Moment
    start_actual_time?: moment.Moment,
    end_actual_time?: moment.Moment
}


export interface Entry {
    "apiCode": string,
    "data": EntryData
}

export interface Group {
    id: string,
    title: string
    primaryShift: [string, string],
    primaryLocation: string,
    alias: string
}

type Unit = `second` | `minute` | `hour` | `day` | `week` | `isoWeek` | `month` | `year`

const FORMAT_LABEL: LabelFormat = {
    year: {
        long: 'YYYY',
        mediumLong: 'YY',
        medium: 'YY',
        short: 'YY'
    },
    month: {
        long: 'MMMM YYYY',
        mediumLong: 'MM',
        medium: 'MM',
        short: 'MM/YY'
    },
    week: {
        long: 'MMMM YYYY',
        mediumLong: 'w',
        medium: 'w',
        short: 'w'
    },
    day: {
        long: 'ddd MMM Do',
        mediumLong: 'ddd MMM Do',
        medium: 'ddd MMM Do',
        short: 'ddd Do'
    },
    hour: {
        long: 'dddd, LL, HH:00',
        mediumLong: 'L, HH:00',
        medium: 'HH:00',
        short: 'HH'
    },
    minute: {
        long: 'HH:mm',
        mediumLong: 'HH:mm',
        medium: 'HH:mm',
        short: 'mm',
    }
}

export const label_format = ([startTime, endTime]: [moment.Moment, moment.Moment],
    unit: Unit,
    labelWidth: number,
    formatOptions: LabelFormat = FORMAT_LABEL): string => {
    let format
    if (labelWidth >= 150) {
        //@ts-ignore
        format = formatOptions[unit]['long']
    } else if (labelWidth >= 100) {
        //@ts-ignore
        format = formatOptions[unit]['mediumLong']
    } else if (labelWidth >= 50) {
        //@ts-ignore
        format = formatOptions[unit]['medium']
    } else {
        //@ts-ignore
        format = formatOptions[unit]['short']
    }
    return startTime.format(format)
}

export const filter_groups_by_location = (groups: Group[], items: Item[]) => {
    let newGroups = [...groups]
    let gNames = items.map((item: Item) => {
        return item.group
    })
    const sgNames = new Set(gNames)
    gNames = Array.from(sgNames)
    newGroups = newGroups.filter(g => gNames.includes(g.title))
    console.log('filtered groups', newGroups)

    return newGroups
}

export const make_employee_groups = (employees: Employee[], department: string, role: string) => {
    const groups: Group[] = []
    employees.forEach((emp: Employee, idx: number) => {
        var primaryShift: [string, string]
        if (emp.PrimaryShift && emp.PrimaryShift !== "None") {
            primaryShift = JSON.parse(emp.PrimaryShift) as [string, string]
        }
        else {
            primaryShift = ["8:00", "17:00"]
        }
        const primaryLocation = emp.PrimaryLocation ? emp.PrimaryLocation : 'HQ'
        const matchesDept = department === "" || emp.Department === department
        const matchesRole = role === "" || emp.Role.includes(role)
        // console.log('matchesDept', matchesDept, 'matchesRole', matchesRole)
        if (matchesDept && matchesRole) {
            const group = {
                id: emp.label as string,
                title: emp.label as string,
                primaryShift: primaryShift,
                primaryLocation: primaryLocation,
                alias: emp.Alias,
                deptartment: emp.Department,
                role: emp.Role
            }
            groups.push(group)
        }
    })
    console.log('groups', groups)
    return groups
}

const create_item = (title: string, location: string, dateRange: DateRange, entry: EntryData) => {
    const [locationColor, fontColor] = get_location_color(title)
    const item: Item = {
        id: entry.id,
        group: entry.Name,
        title: title,
        alias: entry.Alias,
        department: entry.Department,
        baseCamp: entry.BaseCamp,
        comment: entry.Comment,
        entryId: entry.id,
        color: fontColor,
        bgColor: locationColor,
        location: location,
        start_time: moment(dateRange[0]),
        end_time: moment(dateRange[1]),
    }
    return item
}

export const entries_to_items = (entries: EntryData[]) => {

    // return empty array if entries is an error message
    if (Object.keys(entries).includes('name')) {
        return []
    }

    let items: Item[] = []

    entries.forEach((entry: EntryData, idx) => {
        let dateRange = [moment(entry.Date + " 8:00:00").toISOString(),
        moment(entry.Date + " 17:00:00").toISOString()] as DateRange
        let title: string = ''
        let locs = ALL_LOCATIONS as Array<keyof EntryData>
        locs.forEach((loc: keyof EntryData, idx: number) => {
            const dr = entry[loc] as string
            const notEmpty = dr !== null && dr !== "null" && dr !== "[]" && dr !== undefined
            if (notEmpty) {
                dateRange = JSON.parse(dr) as DateRange
                const leave = ["Vacation", "Sick", "FamilySick", "JuryDuty"].includes(loc)
                title = loc
                if (leave) title = 'Leave'

                const item = create_item(title, loc, dateRange, entry)
                items.push(item)
            }
        })
    })

    return items
}

const tooltip_creator = (item: Item) => {
    const st = item.start_actual_time ? item.start_actual_time : item.start_time
    const et = item.end_actual_time ? item.end_actual_time : item.end_time
    return (
        <React.Fragment>
            {item.group && (<p>{item.group}</p>)}
            {item.comment && (<p>{item.comment}</p>)}
            {item.start_time && (<p>Start time: {st?.format('ddd HH:mm')}</p>)}
            {item.end_time && (<p>End time: {et?.format('ddd HH:mm')}</p>)}
        </React.Fragment>
    )
}

export const itemRenderer =
    ({ item, itemContext, getItemProps, getResizeProps }: ReactCalendarItemRendererProps<Item>) => {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
        const backgroundColor = itemContext.selected ? (itemContext.dragging ? "red" : item.selectedBgColor) : item.bgColor;
        const borderColor = itemContext.resizing ? "red" : item.color;
        const tooltipPopup = tooltip_creator(item)

        const st = item.start_actual_time ? item.start_actual_time : item.start_time
        const et = item.end_actual_time ? item.end_actual_time : item.end_time

        const text = itemContext.title + " " + st.format('h') + "-" + et.format('h')
        return (
            <Tooltip placement="top" title={tooltipPopup}>
                <div>
                    <div
                        {...getItemProps({
                            style: {
                                backgroundColor,
                                color: item.color,
                                borderColor,
                                borderStyle: "solid",
                                borderWidth: 1,
                                borderRadius: 4,
                                borderLeftWidth: itemContext.selected ? 3 : 1,
                                borderRightWidth: itemContext.selected ? 3 : 1
                            },
                            onMouseDown: () => {
                                console.log("on item click", item);
                            }
                        })}
                    >
                        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

                        <div
                            style={{
                                height: itemContext.dimensions.height,
                                overflow: "hidden",
                                paddingLeft: 3,
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textAlign: "center"
                            }}
                        >
                            {text}
                        </div>
                        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
                    </div>
                </div>
            </Tooltip>
        );
    };

const generate_items = (group: Group, location: string, groupItems: Item[], dates: moment.Moment[], idx: number, comment = 'Synthetic event') => {

    let synthItems: Item[] = []
    let newIdx = idx

    dates.forEach((date: moment.Moment) => {

        const isWeekday = date.isoWeekday() < 6 //saturday=6 sunday=7
        let realItem = groupItems.find((item: Item) => { // find first item that falls on date.
            return item.start_time.isSame(date, 'day')
        })
        if (location.includes('Holiday')) realItem = undefined
        newIdx += 1

        const startArray = group.primaryShift[0].split(':')
        const endArray = group.primaryShift[1].split(':')
        try {
            const sHour: number = Number(startArray[0])
            const sMinute: number = startArray.length > 1 ? Number(startArray[1]) : 0
            const eHour: number = Number(endArray[0])
            const eMinute: number = endArray.length > 1 ? Number(endArray[1]) : 0

            if ((!realItem && isWeekday) || location==='Holiday') { //holidays have double entries
                const [locationColor, fontColor] = get_location_color(location)
                const synthItem: Item = {
                    id: newIdx,
                    group: group.id,
                    alias: group.alias,
                    entryId: newIdx,
                    location: location,
                    comment: comment,
                    title: location,
                    start_time: date.clone().set({
                        hour: sHour,
                        minute: sMinute,
                        second: 0
                    }),
                    end_time: date.clone().set({
                        hour: eHour,
                        minute: eMinute,
                        second: 0
                    }),
                    bgColor: locationColor,
                    color: fontColor,
                }
                synthItems.push(synthItem)
            }
        }
        catch {
            console.error('failed to create item. primary shift', group.primaryShift)
        }

    })

    return ({ synthItems, newIdx })
}

export const generate_holiday_items = (
    groups: Group[],
    items: Item[],
    datesStr: string[]) => {

    if (!Array.isArray(datesStr)) return [] //ignore if error 
    if (datesStr.length <= 0) return [] //ignore if no holidays

    let idx = moment().valueOf()
    let entries: Item[] = []

    const dates = datesStr.map((date: string) => {
        return moment(date)
    })

    // generate entries for group
    groups.forEach((group: Group) => {
        // get exiting entries for group
        const groupItems: Item[] = []
        items.forEach((item: Item) => {
            if (item.group === group.id) {
                groupItems.push(item)
            }
        })

        //add holidays to pool of entries 
        if (group.primaryLocation !== "None") { 
        //generate_entries 
        const { synthItems, newIdx } = generate_items(group, 'Holiday', groupItems, dates, idx, 'Holiday')
        idx = newIdx
        entries = [...entries, ...synthItems]
        }
    })

    return entries

}