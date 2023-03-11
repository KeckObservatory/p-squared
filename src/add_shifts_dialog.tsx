import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { EntryForm } from './entry_form'
import { EntryState, Employee, useEntryStateContext } from './control';
import { add_entry, delete_entry_by_id, edit_entry_by_id } from './api';
import moment from 'moment';
import { EntryData } from './p_timeline_utils';
import Typography from '@mui/material/Typography';
import { ShiftEntryForm } from './shift_entry_form';

interface Props {
    employees: Employee[]
    roles: string[]
}

interface ChildRefObject {
    getChildState: Function
}

export const AddShiftsDialog = (props: Props) => {

  const [open, setOpen] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | undefined>(undefined);
  const childStateRef = React.useRef<ChildRefObject>(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const childState = childStateRef?.current?.getChildState()
    console.log('child state is: ', childState)
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button style={{ margin: '12px'  }} variant="contained" onClick={handleClickOpen}>
        Create Shifts 
      </Button>
      <Dialog
        sx={{ paddingTop: '3px' }}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Create Shifts 
        </DialogTitle>
        <DialogContent>
          {errMsg && (
            <Typography sx={{ color: 'red' }} variant="caption">{errMsg}</Typography>
          )}
          <ShiftEntryForm
            ref={childStateRef}
            employees={props.employees}
            roles={props.roles}
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
    </React.Fragment>
  );
}