import { resolve } from 'node:path/win32'
import { default as mock_entries } from './entries.json'
import { default as mock_employees } from './employees.json'
import { Entry, EntryData } from './p_timeline'
import { Employee } from './control'
import moment from 'moment'
import axios, { AxiosError, AxiosResponse } from 'axios'

// const BASE_URL = "https://vm-appserver.keck.hawaii.edu/api/pp/"

const BASE_URL = "https://www3build.keck.hawaii.edu"
const API_URL = BASE_URL + "/api/pp/"
const TEL_API_URL = 'https://www.keck.hawaii.edu/software/db_api/telSchedule.php?cmd=getEmployee'

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

export const mock_get_employees = (): Promise<Employee[]> => {
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

export const get_employees = (): Promise<Employee[]> => {
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

export const add_entry = (entry: any) => {
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

export const get_entries_by_date_range= (
    startDate: string,
    endDate: string,
    department?: string,
    location?: string): Promise<EntryData[]>  => {
    let url = API_URL + "entryByDateRange?"
    + "startdate=" + startDate
    +  "&enddate=" + endDate
    if(department) {
        url += '&Department=' + department
    }
    if(location) {
        url += '&' + location + '=1' 
    }
    return axios.get(url)
    .then(handleResponse)
    .then((entry: any) => {
        return entry.data        
    })
    .catch(handleError)
}
