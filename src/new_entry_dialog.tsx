import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { NewEntryForm } from './new_entry_form'
import { useEntry, EntryState } from './control';
import { add_entry } from './api';
import moment from 'moment';

interface Props {
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

const state_to_entries = (entryState: EntryState) => {
  const location = entryState.location
  const date = moment(entryState.dateRange[0]).format('YYYY-MM-DD')
  const creationTime = moment().format('YYYY-MM-DD HH:mm:ss')
  const startDate = moment(entryState.dateRange[0])
    .set('hour', entryState.startTime)
    .set('minute', 0).set('second', 0)
  const endDate = moment(entryState.dateRange[1])
    .set('hour', entryState.endTime)
    .set('minute', 0).set('second', 0)
  // console.log('date, creation time', date, creationTime, startDate, endDate)
  const dates = get_days_between_dates(startDate, endDate)
  console.log('dates to add', dates)
  let base_entry: any = {
    Name: entryState.name,
    Date: date,
    Department: entryState.department,
    BaseCamp: entryState.baseCamp,
    Comment: entryState.comment ?? null,
    Staff: entryState.staff ?? 'test',
    AlternatePickup: entryState.alternatePickup ?? null,
    SummitLead: entryState.summitLead ?? null,
    CrewLead: entryState.crewLead ?? null,
    Seats: entryState.seats ?? null,
    CreationTime: creationTime,
    LastModification: creationTime,
  }

  let entries: any[] = []
  dates.map((dte: moment.Moment) => {
    const entry = { ...base_entry }
    const startDate = moment(dte)
      .set('hour', entryState.startTime)
      .set('minute', 0).set('second', 0)
    const endDate = moment(dte)
      .set('hour', entryState.endTime)
      .set('minute', 0).set('second', 0)
    if (startDate > endDate) {
      endDate.add(1, 'days') // add 24 hours so that startDate <= endDate
    }
    entry[location] = JSON.stringify([startDate.format('YYYY-MM-DD HH:mm:ss'), endDate.format('YYYY-MM-DD HH:mm:ss')])
    entries.push(entry)
  })
  return entries
}

export const NewEntryDialog = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [entryState, setEntryState] = useEntry()
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const entries = state_to_entries(entryState)
    entries.forEach((entry: any) => {
      console.log('submitting entry', entryState, entry)
      add_entry(entry)
        .then((response: any) => {
          console.log('response', response)
        })
        .finally(() => {
          setOpen(false)
        })
    })
  }

  return (
    <div>
      <Button style={{ margin: '9px' }} variant="outlined" onClick={handleClickOpen}>
        Create New Entry
      </Button>
      <Dialog
        sx={{paddingTop: '3px'}}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Create new entry"}
        </DialogTitle>
        <DialogContent>
          <NewEntryForm />
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