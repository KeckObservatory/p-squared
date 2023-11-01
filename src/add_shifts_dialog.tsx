import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Employee, DATE_FORMAT } from './control';
import { add_entry } from './api';
import moment from 'moment';
import { EntryData } from './p_timeline_utils';
import Typography from '@mui/material/Typography';
import { DaysOfWeek, ShiftEntryForm, ShiftState } from './shift_entry_form';
import { DATETIME_FORMAT } from './control';

interface Props {
  staff: string
  employees: Employee[]
  roles: string[]
  handleEntrySubmit: () => Promise<void>
}

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const PRIMARY_LOCATION = ['SU']

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


  //hours are zero
  const shiftLength = Number(shiftState.endHour) - Number(shiftState.startHour)
  if (shiftLength === 0) {
    setErrMsg('Shift cannot be zero. Adjust times')
    return true
  }

  //start hour > end hour
  if (JSON.parse(shiftState.startHour) >= JSON.parse(shiftState.endHour)) {
    setErrMsg('Start time cannot be larger than end time')
    return true
  }

  setErrMsg(undefined)
  return false
}

const enumerate_days_between_dates = (startDate: moment.Moment, endDate: moment.Moment) => {
  let currDate = startDate.startOf('day');

  let dates = [currDate.clone()];
  const lastDate = endDate.startOf('day');
  while (currDate.add(1, 'days').diff(lastDate) <= 0) {
    dates.push(currDate.clone())
  }
  return dates;
};

const shift_state_to_entries = (shiftState: ShiftState, staff: string) => {

  let entries: EntryData[] = []
  const creationTime = moment().format(DATETIME_FORMAT)

  let dates = enumerate_days_between_dates(shiftState.dateRange[0], shiftState.dateRange[1])
  dates = dates.filter((date: moment.Moment) => {
    const dow = date.day()
    const day = DAYS_OF_WEEK[dow] as keyof DaysOfWeek
    const dowChecked = shiftState.selectedDaysOfWeek[day]
    console.log(date.format(), 'dow', dow, 'day', day, 'dowChecked', dowChecked)
    return dowChecked
  })
  console.log('shift dates', dates)
  // for user in users
  shiftState.selectedEmployees.forEach((employee: Employee) => {
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
      SupportLead: shiftState.supportLead ?? undefined,
      CrewLead: shiftState.crewLead ?? undefined,
      Seats: shiftState.seats ?? undefined,
      CreationTime: creationTime,
      LastModification: creationTime,
    }

    dates.forEach((date: moment.Moment) => {
      const dateStr = date.format(DATE_FORMAT)
      const startDatetime = date.clone()
        .set('hour', Number(shiftState.startHour))
        .set('minute', Number(shiftState.startMinutes)).set('second', 0)
      let endDatetime = date.clone()
        .set('hour', Number(shiftState.endHour))
        .set('minute', Number(shiftState.endMinutes)).set('second', 0)
      const shift = JSON.stringify([startDatetime.format(DATETIME_FORMAT), endDatetime.format(DATETIME_FORMAT)])
      const entry = {
        ...base_entry,
        Date: dateStr,
        [shiftState.location]: shift
      }
      entries.push(entry as EntryData)

    })

  })

  return entries
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
    console.log('shift entries are: ', entries)
    entries.forEach((entry: EntryData) => {
      add_entry(entry)
    })
    props.handleEntrySubmit()
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