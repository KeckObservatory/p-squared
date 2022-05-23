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

const state_to_entry = (entryState: EntryState ) => {
  const location = entryState.location
  const date = moment(entryState.dateRange[0]).format('YYYY-MM-DD')
  const startDate = moment(entryState.dateRange[0])
  .set('hour', entryState.startTime)
  .set('minute', 0).set('second', 0)
  .format('YYYY-MM-DD HH:mm:ss')
  const endDate = moment(entryState.dateRange[1])
  .set('hour', entryState.endTime)
  .set('minute', 0).set('second', 0)
  .format('YYYY-MM-DD HH:mm:ss')
  const creationTime = moment().format('YYYY-MM-DD HH:mm:ss') 
  console.log('date, creation time', date, creationTime, startDate, endDate)
  let entry: any = {
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
  entry[location] = JSON.stringify([startDate, endDate] )
  return entry
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
    const entry = state_to_entry(entryState)
    console.log('submitting entry', entryState, entry)
    add_entry(entry)
    .then( (response: any) => {
      console.log('response', response)
    })
    
  }

  return (
    <div>
      <Button style={{ margin: '6px' }} variant="outlined" onClick={handleClickOpen}>
        Create New Entry
      </Button>
      <Dialog
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

export { }