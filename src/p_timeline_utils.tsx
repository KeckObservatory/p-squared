import moment from 'moment'
import { ReactCalendarItemRendererProps } from 'react-calendar-timeline'
import { ControlState, Employee } from './control'
import Tooltip from '@mui/material/Tooltip';

export const LOCATIONS: Array<keyof EntryData> = [
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

const colorMapping = {
    orange: '#e69f00',
    blue: '#56b4e9',
    green: '#009e73',
    pink: '#cc79a7',
    yellow: '#f0e442',
    darkBlue: '#0072b2',
    darkOrange: '#d55e00'
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
            color = colorMapping['pink']
            break;
        case "Vacation":
            color = colorMapping['yellow']
            break;
        case "Sick":
        case "FamilySick":
        case "Sick":
        case "JuryDuty":
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

export interface Group {
    id: string,
    title: string
}

export const make_employee_groups = (employees: Employee[], controlState: ControlState) => {
    const groups: Group[] = []
    employees.forEach((emp: Employee, idx: number) => {
        if (controlState.department === "" || emp.Department === controlState.department) {
            const group = { id: emp.label as string, title: emp.label as string }
            groups.push(group)
        }
    })
    return groups
}

export const make_groups = (entries: EntryData[]) => {
    const names = entries.map((entry: EntryData) => {
        return entry.Name
    })
    const uNames = new Set(names)
    const groups = Array.from(uNames).map((name: string, idx) => {
        const group: Group = { id: name, title: name }
        return group
    })

    return groups
}

export const entries_to_items = (entries: EntryData[]) => {

    const items = entries.map((entry: EntryData, idx) => {
        let dateRange = [moment(entry.Date + " 8:00:00").toISOString(),
        moment(entry.Date + " 17:00:00").toISOString()] as DateRange
        let title: string = ''
        LOCATIONS.every((loc: keyof EntryData) => {
            const dr = entry[loc] as string
            if (dr !== null && dr !== "null" && dr !== "[]") {
                dateRange = JSON.parse(dr) as DateRange
                title = loc
                return false
            }
            return true
        })
        const item: any = {
            id: entry.id,
            group: entry.Name,
            title: title,
            comment: entry.Comment,
            bgColor: get_location_color(title),
            start_time: moment(dateRange[0]),
            end_time: moment(dateRange[1])
        }
        return item
    })

    return items
}


export const itemRenderer =
    ({ item, itemContext, getItemProps, getResizeProps }: ReactCalendarItemRendererProps<any>) => {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
        const backgroundColor = itemContext.selected ? (itemContext.dragging ? "red" : item.selectedBgColor) : item.bgColor;
        const borderColor = itemContext.resizing ? "red" : item.color;
        return (
            <Tooltip title={item.comment}>
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