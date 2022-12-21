import { resolve } from 'node:path/win32'
import { default as mock_entries } from './entries.json'
import { default as mock_employees } from './employees.json'
import { Entry, EntryData } from './p_timeline_utils'
import { Employee } from './control'
import moment from 'moment'
import axios, { AxiosError, AxiosResponse } from 'axios'

// const BASE_URL = "https://vm-appserver.keck.hawaii.edu/api/pp/"
// const TEL_API_URL =  'https://www3build.keck.hawaii.edu/api/telSchedule?cmd=getEmployee'
// const TEL_API_URL = 'https://www.keck.hawaii.edu/sandbox/jmader/www/software/db_api/telSchedule.php?cmd=getEmployee'

const BASE_URL = "https://www3build.keck.hawaii.edu"
const API_URL = BASE_URL + "/api/pp/"
const TEL_API_URL = 'https://www3build.keck.hawaii.edu/api/telSchedule2?cmd=getEmployee'

const IS_PRODUCTION: boolean = process.env.REACT_APP_ENVIRONMENT === 'production'

export interface User {
    Status: string,
    Alias: string,
    FirstName: string,
    LastName: string,
    Department: string,
    Role: string,
    BaseCamp: string,
    HomePhone: string,
    CellPhone: string,
    OfficePhone: string,
    SummitPhone: string,
    Admin?: string
}

export function handleResponse(response: AxiosResponse) {
    if (response.data) {
        return response.data;
    }
    return response;
}

export function handleError(error: Error | AxiosError) {
    if (axios.isAxiosError(error)) {
        return error.toJSON();
    }
    return error;
}

const get_staffinfo_promise = (): Promise<User> => {
    const url = BASE_URL + '/staffinfo';
    return axiosInstance.get(url)
        .then(handleResponse)
        .then(handleError) as Promise<User>
}

const mock_get_staffinfo_promise = (): Promise<User> => {
    const mockPromise = new Promise<User>((resolve) => {
        resolve({
            Status: "GOOD",
            Alias: "ttucker",
            FirstName: "Tyler",
            LastName: "Tucker",
            Department: "Scientific Software",
            Role: "",
            BaseCamp: "Waimea",
            HomePhone: "",
            CellPhone: "",
            OfficePhone: "",
            SummitPhone: "",
        })
    })
    return mockPromise
}


//TODO format to match api output (entry with an array of entrydata)
const mock_get_entries_by_date_range_promise = (
    startDate: string,
    endDate: string,
    department?: string,
    location?: string): Promise<EntryData[]> => {
    const mockPromise = new Promise<EntryData[]>((resolve) => {
        const entryData: EntryData[] = []
        mock_entries.forEach((entry: any) => {
            entryData.push(entry.data)
        })
        resolve(entryData)
    })
    return mockPromise
}

const mock_get_employees_promise = (): Promise<Employee[]> => {
    const mockPromise = new Promise<Employee[]>((resolve) => {
        resolve(mock_employees)
    })
    return mockPromise
}

const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
})

export const get_employees_promise = (): Promise<Employee[]> => {
    return axiosInstance.get(TEL_API_URL)
        .then(handleResponse)
        .catch(handleError)
}

export const delete_entry_by_id = (
    id: number) => {
    let url = API_URL + "entryById?"
        + "id=" + JSON.stringify(id)
    return axios.delete(url)
        .then(handleResponse)
        .catch(handleError)
}

export const add_entry = (entry: EntryData) => {
    let url = API_URL + "entryById?"
    return axios({
        method: "post",
        url: url,
        data: entry,
        headers: { "Content-Type": "multipart/form-data" }
    }
    )
        .then(handleResponse)
        .catch(handleError)
}

export const edit_entry_by_id = (id: number, entry: EntryData) => {
    let url = API_URL + "putEntryById?"
        + "id=" + JSON.stringify(id)
    return axios.put(url)
        .then(handleResponse)
        .catch(handleError)

}

export const get_entries_by_date_range_promise = (
    startDate: string,
    endDate: string,
    department?: string,
    location?: string): Promise<EntryData[]> => {
    let url = API_URL + "entryByDateRange?"
        + "startdate=" + startDate
        + "&enddate=" + endDate
    if (department) {
        url += '&Department=' + department
    }
    if (location === 'Leave') {
        url += '&leave=1'  //needs to be lowercase
    }
    else if (location) {
        url += '&' + location + '=1'
    }
    else {

    }

    return axios.get(url)
        .then(handleResponse)
        .then((entry: any) => {
            return entry.data
        })
        .catch(handleError)
}

export const get_staffinfo = IS_PRODUCTION ? get_staffinfo_promise : mock_get_staffinfo_promise
export const get_entries_by_date_range = IS_PRODUCTION ? get_entries_by_date_range_promise : mock_get_entries_by_date_range_promise
export const get_employees = IS_PRODUCTION ? get_employees_promise : mock_get_employees_promise