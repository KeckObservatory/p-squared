import { resolve } from 'node:path/win32'
import { default as mock_entries } from './entries.json'
import { Entry, EntryData } from './p_timeline'
import moment from 'moment'
import axios, { AxiosError, AxiosResponse } from 'axios'

const BASE_URL = "https://vm-appserver.keck.hawaii.edu/api/pp/"

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

export const mock_get_entries_by_date_range = (
    startDate: string,
    endDate: string,
    department?: string[],
    location?: string): Promise<Entry[]> => {
    const mockPromise = new Promise<Entry[]>((resolve) => {
        resolve(mock_entries as any)
    })
    return mockPromise
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