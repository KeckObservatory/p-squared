import { resolve } from 'node:path/win32'
import { default as mock_entries } from './entries.json'
import { Entry } from './p_timeline'
import moment from 'moment'

export const mock_get_entries_by_date_range = (
    startDate: moment.Moment, 
    endDate: moment.Moment,
    department?: string[], 
    location?: string) => {
    const mockPromise = new Promise<Entry[]>((resolve) => {
        resolve( mock_entries as any )
    })
    return mockPromise 
}

// export const mock_get_container_ob_metadata = (semid: string, container_id?: string) => {
//     const mockPromise = new Promise<Partial<ObservationBlock[]>>((resolve) => {
//        resolve( mock_metadata as any )
//     })
//     return mockPromise 
//  }
 