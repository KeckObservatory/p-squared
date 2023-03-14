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
import { ShiftEntryForm, ShiftState } from './shift_entry_form';
import { DATETIME_FORMAT } from './control';

interface Props {
  staff: string
  employees: Employee[]
  roles: string[]
}

interface ChildRefObject {
  getChildState: Function
}

const check_for_errors = (shiftState: ShiftState, setErrMsg: Function) => {

  //date range
  const maxDayRange = 30
  const dt = moment(shiftState.dateRange[1]).diff(moment(shiftState.dateRange[0]), 'days')
  if (dt >= maxDayRange) {
    setErrMsg(`date range cannot be longer than ${maxDayRange}`)
    return true
  }

  //location not specified
  if (!shiftState.location) {
    setErrMsg('Locations cannot be blank')
    return true
  }

  //start hour > end hour
  if (JSON.parse(shiftState.startTime) >= JSON.parse(shiftState.endTime) ){
    setErrMsg('Start time cannot be larger than end time')
    return true
  }

  setErrMsg(undefined)
  return false
}

const enumerate_days_between_dates = function(startDate: moment.Moment, endDate: moment.Moment) {
  let dates = [];

  let currDate = moment(startDate).startOf('day');
  const lastDate = moment(endDate).startOf('day');

  while(currDate.add(1, 'days').diff(lastDate) < 0) {
      dates.push(currDate.clone())
  }

  return dates;
};

const shift_state_to_entries = (shiftState: ShiftState, staff: string) => {

  const creationTime = moment().format(DATETIME_FORMAT)

  const dates = enumerate_days_between_dates(shiftState.dateRange[0], shiftState.dateRange[1])
  // for user in users
  shiftState.selectedRoleEmployees.forEach((employee: Employee) => {
    const name = employee.LastName + ', ' + employee.FirstName

    let base_entry: Partial<EntryData> = {
      Name: name,
      Date: "",
      Department: employee.Department,
      BaseCamp: employee.BaseCamp,
      Alias: employee.Alias,
      Comment: shiftState.comment,
      Staff: staff,
      AlternatePickup: shiftState.alternatePickup ?? undefined,
      SummitLead: shiftState.summitLead ?? undefined,
      CrewLead: shiftState.crewLead ?? undefined,
      Seats: shiftState.seats ?? undefined,
      CreationTime: creationTime,
      LastModification: creationTime,
    }


  })

  // for date in dates

  // if day of week checked, add entry. Ignore holidays

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
    const shiftState = childStateRef?.current?.getChildState()
    console.log('shift state is: ', shiftState)
    if (check_for_errors(shiftState, setErrMsg)) {
      return
    }

    const entries = shift_state_to_entries(shiftState, props.staff)
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button style={{ margin: '12px' }} variant="contained" onClick={handleClickOpen}>
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