import { resolve } from 'node:path/win32'
import { default as mock_entries } from './entries.json'
import { Entry, EntryData } from './p_timeline'
import moment from 'moment'
import axios, { AxiosError, AxiosResponse } from 'axios'

// const BASE_URL = "https://vm-appserver.keck.hawaii.edu/api/pp/"
const BASE_URL = "https://www3build.keck.hawaii.edu/api/pp/"

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

//TODO format to match api output (entry with an array of entrydata)
export const mock_get_entries_by_date_range = (
    startDate: string,
    endDate: string,
    department?: string[],
    location?: string): Promise<EntryData[]> => {
    const mockPromise = new Promise<EntryData[]>((resolve) => {
        const entryData: EntryData[] = []
        mock_entries.forEach( (entry: any) => {
            entryData.push(entry.data)
        })
        resolve(entryData)
    })
    return mockPromise
}

export const delete_entry_by_id = (
    id: number) => {
    let url = BASE_URL + "entryById?"
    + "id=" + JSON.stringify(id)
    return axios.delete(url)
    .then(handleResponse)
    .catch(handleError)
}

export const get_entries_by_date_range= (
    startDate: string,
    endDate: string,
    department?: string[],
    location?: string): Promise<EntryData[]>  => {
    let url = BASE_URL + "entryByDateRange?"
    + "startdate=" + startDate
    +  "&enddate=" + endDate
    if(department) {
        url += '&department=' + department
    }
    if(location) {
        url += '&location=' + location 
    }
    return axios.get(url)
    .then(handleResponse)
    .then((entry: any) => {
        return entry.data        
    })
    .catch(handleError)
}