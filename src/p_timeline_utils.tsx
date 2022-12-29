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
    black: '#000000'
}

const get_location_color = (location: string) => {
    let color: string
    switch (location) {
        case "HQ":
            color = 'darkBlue'
            break;
        case "SU":
        case "HP":
        case "Hilo":
        case "Kona":
            color = colorMapping['orange']
            break;
        case "WFH":
        case "Remote":
            color = colorMapping['pink']
            break;
        case "Vacation":
            color = colorMapping['yellow']
            break;
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
            break;
        case "other":
            color = colorMapping['darkOrange']
            break;
        default:
            color = colorMapping['darkBlue']
    }
    return color

}

export type DateRange = [null | string, null | string]

export interface EntryData {
    "id": number,
    "Date": string | DateRange,
    "Name": string,
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
    "AlternatePickup": unknown,
    "SummitLead": unknown,
    "SupportLead": unknown,
    "CrewLead": unknown,
    "Seats": unknown,
    "CreationTime": string,
    "LastModification": string,
}

export interface Item {
    id: string | number,
    group: string,
    title: string,
    entryId: number,
    location: string,
    comment?: string,
    bgColor?: string,
    selectedBgColor?: string,
    color?: string,
    start_time: moment.Moment,
    end_time: moment.Moment
}


export interface Entry {
    "apiCode": string,
    "data": EntryData
}

export interface Group {
    id: string,
    title: string
    primaryShift: [number, number],
    primaryLocation: string,
    alias: string
}

type Unit = `second` | `minute` | `hour` | `day` | `week` | `isoWeek` | `month` | `year`

const formatLabel: LabelFormat = {
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
        long: 'w',
        mediumLong: 'w',
        medium: 'w',
        short: 'w'
    },
    day: {
        long: 'ddd Do',
        mediumLong: 'ddd Do',
        medium: 'ddd Do',
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
    formatOptions: LabelFormat = formatLabel): string => {
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

export const make_employee_groups = (employees: Employee[], controlState: ControlState) => {
    const groups: Group[] = []
    employees.forEach((emp: Employee, idx: number) => {
        const primaryShift = emp.PrimaryShift && emp.PrimaryShift !== "None" ? JSON.parse(emp.PrimaryShift) : [8, 17]
        const primaryLocation = emp.PrimaryLocation ? emp.PrimaryLocation : 'HQ'
        const matchesDept = controlState.department === "" || emp.Department === controlState.department
        if (matchesDept) {
            const group = {
                id: emp.label as string,
                title: emp.label as string,
                primaryShift: primaryShift as [number, number],
                primaryLocation: primaryLocation,
                alias: emp.Alias
            }
            groups.push(group)
        }
    })
    return groups
}

const create_item = (title: string, location: string, dateRange: DateRange, entry: EntryData) => {
    const item: Item = {
        id: entry.id,
        group: entry.Name,
        title: title,
        comment: entry.Comment,
        entryId: entry.id,
        color: colorMapping['white'],
        bgColor: get_location_color(title),
        location: location,
        start_time: moment(dateRange[0]),
        end_time: moment(dateRange[1])
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
        const titles: string[] = []
        const locations: string[] = []
        const dateRanges: DateRange[] = []
        let locs = ALL_LOCATIONS as Array<keyof EntryData>
        locs.forEach((loc: keyof EntryData) => {
            const dr = entry[loc] as string
            const notEmpty = dr !== null && dr !== "null" && dr !== "[]" && dr !== undefined
            if (notEmpty) {
                dateRange = JSON.parse(dr) as DateRange
                const leave = ["Vacation", "Sick", "FamilySick", "JuryDuty"].includes(loc)
                title = loc
                locations.push(loc)
                if (leave) title = 'Leave'
                titles.push(title)
                dateRanges.push(dateRange as DateRange)
            }
        })

        for (let idx = 0; idx < titles.length; idx++) {
            const item = create_item(titles[idx], locations[idx], dateRanges[idx], entry)
            items.push(item)
        }
    })

    return items
}

const tooltip_creator = (comment?: string, startTime?: moment.Moment, endTime?: moment.Moment) => {
    return (
        <React.Fragment>
            {comment && (<p>{comment}</p>)}
            {startTime && (<p>Start time: {startTime?.format('ddd HH:mm')}</p>)}
            {endTime && (<p>End time: {endTime?.format('ddd HH:mm')}</p>)}
        </React.Fragment>
    )
}

export const itemRenderer =
    ({ item, itemContext, getItemProps, getResizeProps }: ReactCalendarItemRendererProps<Item>) => {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
        const backgroundColor = itemContext.selected ? (itemContext.dragging ? "red" : item.selectedBgColor) : item.bgColor;
        const borderColor = itemContext.resizing ? "red" : item.color;
        const tooltipPopup = tooltip_creator(item.comment, item.start_time, item.end_time)
        return (
            <Tooltip title={tooltipPopup}>
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
                            whiteSpace: "nowrap"
                        }}
                    >
                        {itemContext.title}
                    </div>

                    {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
                </div>
            </Tooltip>
        );
    };

const get_date_array = (startDate: moment.Moment, endDate: moment.Moment) => {
    let dates = [];

    let currDate = startDate.startOf('day');
    const lastDate = endDate.startOf('day');
    while (currDate.add(1, 'days').diff(lastDate) < 0) {
        dates.push(currDate.clone());
    }

    return dates;
};

const generate_items = (group: Group, location: string, groupItems: Item[], dates: moment.Moment[], idx: number, comment='Synthetic event' ) => {

    let synthItems: Item[] = []
    let newIdx = idx

    dates.forEach((date: moment.Moment) => {

        const isWeekday = date.isoWeekday() < 6 //saturday=6 sunday=7
        const isSummit = group.primaryLocation === 'SU'
        let realItem = groupItems.find((item: Item) => {
            return item.start_time.isSame(date, 'day')
        })
        if (location.includes('Holiday')) realItem = undefined 
        newIdx += 1

        if (!realItem && isWeekday && !isSummit) {
            const synthItem: Item = {
                id: newIdx,
                group: group.id,
                entryId: newIdx,
                location: location,
                comment: comment, 
                title: location,
                start_time: date.clone().set({
                    hour: group.primaryShift[0],
                    minute: 0,
                    second: 0
                }),
                end_time: date.clone().set({
                    hour: group.primaryShift[1],
                    minute: 0,
                    second: 0
                }),
                bgColor: get_location_color(location),
                color: colorMapping['white'],
            }
            synthItems.push(synthItem)
        }

    })

    return ({ synthItems, newIdx })
}

export const generate_holiday_items = ( 
    groups: Group[],
    items: Item[],
    datesStr: string[]) => {


    console.log('holiday datesStr', datesStr)
    if (!Array.isArray(datesStr)) return [] //ignore if error 
    if (datesStr.length<=0) return [] //ignore if no holidays

    let idx = moment().valueOf()
    let syntheticEntries: Item[] = []

    const dates = datesStr.map( (date: string) => {
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

        //add to pool of synthetic entries
        if (group.primaryLocation !== "None") {
            //generate_entries 
            const { synthItems, newIdx } = generate_items(group, 'Holiday', groupItems, dates, idx, 'Holiday')
            idx = newIdx
            syntheticEntries = [...syntheticEntries, ...synthItems]
        }
    })

    console.log('generate_holiday_items', groups, dates, syntheticEntries)

    return syntheticEntries

    }

export const generate_synthetic_items = (
    groups: Group[],
    items: Item[],
    startDate: moment.Moment,
    endDate: moment.Moment) => {

    let syntheticEntries: Item[] = []

    // get array of dates. 

    const dates = get_date_array(startDate, endDate)
    console.log(
        'n dates:', dates.length,
        'n groups', groups.length,
        'n items', items.length,
        'start date', startDate.format('YYYY-MM-DD HH:mm:ss'),
        'endDate', endDate.format('YYYY-MM-DD HH:mm:ss')
    )
    let idx = moment().valueOf()

    // generate entries for group
    groups.forEach((group: Group) => {
        // get exiting entries for group
        const groupItems: Item[] = []
        items.forEach((item: Item) => {
            if (item.group === group.id) {
                groupItems.push(item)
            }
        })

        //add to pool of synthetic entries
        if (group.primaryLocation !== "None") {
            //generate_entries 
            const { synthItems, newIdx } = generate_items(group, group.primaryLocation, groupItems, dates, idx)
            idx = newIdx
            syntheticEntries = [...syntheticEntries, ...synthItems]
        }


    })

    return syntheticEntries

}