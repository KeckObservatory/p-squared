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
import { add_entry } from './api'

interface Props {
}

const state_to_entry = (entryState: EntryState ) => {
  const location = entryState.location
  const date = entryState.dateRange[0]
  const creationTime = new Date().toISOString()
  let entry: any = {
    Name: entryState.name,
    Date: date,
    Department: entryState.department,
    BaseCamp: entryState.baseCamp,
    Comment: entryState.comment,
    Staff: entryState.staff ? entryState.staff : 'test',
    AlternatePickup: entryState.alternatePickup,
    SummitLead: entryState.summitLead,
    CrewLead: entryState.crewLead,
    Seats: entryState.seats,
    CreationTime: creationTime,
    LastModification: creationTime, 
  }
  entry[location] = entryState.dateRange
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