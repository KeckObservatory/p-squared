import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { NewEntryForm } from './new_entry_form'
import { EntryState, Employee } from './control';
import { add_entry } from './api';
import moment from 'moment';
import { EntryData } from './p_timeline_utils';

interface Props {
  employees: Employee[]
  handleEntrySubmit: Function
  entryState: EntryState,
  setEntryState: Function
}

const get_days_between_dates = function (startDate: moment.Moment, endDate: moment.Moment) {
  const now = startDate.clone()
  const dates = [];
  while (now.isSameOrBefore(endDate)) {
    dates.push(now.clone());
    now.add(1, 'days');
  }
  return dates;
};

const add_first_location = (entryState: EntryState, dte: moment.Moment, entry: any) => {
  const startDate = dte.clone()
    .set('hour', entryState.startTime)
    .set('minute', 0).set('second', 0)
  let endDate = dte.clone()
    .set('hour', entryState.endTime)
    .set('minute', 0).set('second', 0)
  if (startDate.isAfter(endDate)) {
    console.log('adding day to endDate')
    endDate = endDate.add(1, 'days') // add 24 hours so that startDate <= endDate
  }

  entry.Date = startDate.format('YYYY-MM-DD')
  entry[entryState.location] =
    JSON.stringify([startDate.format('YYYY-MM-DD HH:mm:ss'),
    endDate.format('YYYY-MM-DD HH:mm:ss')])
  return entry
}

const add_second_location = (entryState: EntryState, dte: moment.Moment, entry: any) => {
  const secondLocation = entryState.startTime2 && entryState.endTime2 && entryState.location2
  if (secondLocation) {
    const startDate2 = dte.clone()
      .set('hour', entryState.startTime2 as number)
      .set('minute', 0).set('second', 0)
    let endDate2 = dte.clone()
      .set('hour', entryState.endTime2 as number)
      .set('minute', 0).set('second', 0)
    if (startDate2.isAfter(endDate2)) {
      console.log('adding day to endDate')
      endDate2 = endDate2.add(1, 'days') // add 24 hours so that startDate <= endDate
    }
    entry.Date = startDate2.format('YYYY-MM-DD')
    entry[entryState.location2 as string] =
      JSON.stringify([startDate2.format('YYYY-MM-DD HH:mm:ss'),
      endDate2.format('YYYY-MM-DD HH:mm:ss')])
  }

  return entry
}

const state_to_entries = (entryState: EntryState) => {
  const date = moment(entryState.dateRange[0]).format('YYYY-MM-DD')
  const creationTime = moment().format('YYYY-MM-DD HH:mm:ss')
  const sd = moment(entryState.dateRange[0])
    .set('hour', entryState.startTime)
    .set('minute', 0).set('second', 0)
  let ed = moment(entryState.dateRange[1])
    .set('hour', entryState.endTime)
    .set('minute', 0).set('second', 0)
  if (entryState.startTime > entryState.endTime) {
    console.log('adding day to endDate')
    ed = ed.add(1, 'days') // add 24 hours so that startDate <= endDate
  }

  let base_entry: Partial<EntryData> = {
    Name: entryState.name,
    Date: date,
    Department: entryState.department,
    BaseCamp: entryState.baseCamp,
    Comment: entryState.comment ?? undefined,
    Staff: entryState.staff ?? 'test',
    AlternatePickup: entryState.alternatePickup ?? undefined,
    SummitLead: entryState.summitLead ?? undefined,
    CrewLead: entryState.crewLead ?? undefined,
    Seats: entryState.seats ?? undefined,
    CreationTime: creationTime,
    LastModification: creationTime,
  }

  const dates = get_days_between_dates(sd, ed)

  let entries: any[] = []
  dates.map((dte: moment.Moment) => {
    let entry = { ...base_entry }
    entry = add_first_location(entryState, dte, entry)
    entry = add_second_location(entryState, dte, entry)
    entries.push(entry)
  })
  return entries
}

export const NewEntryDialog = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const entries = state_to_entries(props.entryState)
    for (let idx = 0; idx < entries.length; idx++) {
      const entry = entries[idx]
      add_entry(entry)
        .then((response: any) => {
          console.log('response', response)
        })
        .finally(() => {
          setOpen(false)
          props.handleEntrySubmit()
        })
    }

  }

  return (
    <div>
      <Button style={{ margin: '9px' }} variant="outlined" onClick={handleClickOpen}>
        Create New Entry
      </Button>
      <Dialog
        sx={{ paddingTop: '3px' }}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Create new entry"}
        </DialogTitle>
        <DialogContent>
          <NewEntryForm
            employees={props.employees}
            entryState={props.entryState}
            setEntryState={props.setEntryState}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}