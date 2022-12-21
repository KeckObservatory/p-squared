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
import { add_entry, edit_entry_by_id } from './api';
import moment from 'moment';
import { EntryData } from './p_timeline_utils';
import Typography from '@mui/material/Typography';

interface Props {
  employees: Employee[]
  handleEntrySubmit: Function
  entryState: EntryState,
  setEntryState: Function
  edit: boolean
  setAnchorEl?: Function 
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

export const AddEditEntryDialog = (props: Props) => {
  const [open, setOpen] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | undefined>(undefined);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
    props.setEntryState((et: EntryState) => {
      return (
        {
          ...et,
          location2: undefined,
          startTime2: undefined,
          endTime2: undefined,
          comment: props.edit ? et.comment : undefined
        }
      )
    })
  };

  const handleClose = () => {
    setOpen(false);
  };

  const check_if_overlap = () => {

    const secondLocation = props.entryState.startTime2
      && props.entryState.endTime2
      && props.entryState.location2
    if (secondLocation) {
      const sd = moment(props.entryState.dateRange[0])
        .set('hour', props.entryState.startTime)
        .set('minute', 0).set('second', 0)
      let ed = moment(props.entryState.dateRange[1])
        .set('hour', props.entryState.endTime)
        .set('minute', 0).set('second', 0)
      if (props.entryState.startTime > props.entryState.endTime) {
        console.log('adding day to endDate')
        ed = ed.add(1, 'days') // add 24 hours so that startDate <= endDate
      }

      const sd2 = moment(props.entryState.dateRange[0])
        .set('hour', props.entryState.startTime2 as number)
        .set('minute', 0).set('second', 0)
      let ed2 = moment(props.entryState.dateRange[1])
        .set('hour', props.entryState.endTime2 as number)
        .set('minute', 0).set('second', 0)
      const wrapAround = (props.entryState.startTime2 as number) > (props.entryState.endTime2 as number)
      if (wrapAround) {
        console.log('adding day to endDate')
        ed2 = ed2.add(1, 'days') // add 24 hours so that startDate <= endDate
      }


      const firstEventFirst = ((sd < sd2) && (ed <= sd2) && (ed < ed2))
      const firstEventSecond = ((sd > sd2) && (ed2 <= sd) && (ed2 < ed))
      console.log('firstEventFirst', firstEventFirst, sd.valueOf(), sd2.valueOf(), ed.valueOf(), ed2.valueOf())
      console.log('entry state:', props.entryState)
      console.log('secondEventFirst', firstEventSecond)
      const overlap = !firstEventFirst && !firstEventSecond
      return overlap
    }
    return false
  }

  const check_for_errors = () => {

    //date range
    const maxDayRange = 7
    const leaveDayRange = 21
    const isVacation = props.entryState.location.includes('Vacation')
    const dt = moment(props.entryState.dateRange[1]).diff(moment(props.entryState.dateRange[0]), 'days')
    if (isVacation && dt >= leaveDayRange) {
      setErrMsg(`date range cannot be longer than ${leaveDayRange}`)
      return true
    }
    else if (!isVacation && dt >= maxDayRange) {
      setErrMsg(`date range cannot be longer than ${maxDayRange}`)
      return true
    }

    //overlap with second location
    const overlap = check_if_overlap()
    if (overlap) {
      setErrMsg('Locations cannot overlap. Adjust times')
      return true
    }

    //location not specified
    const missing2ndLoc = props.entryState.location2 === undefined &&
      (props.entryState.startTime2 !== undefined && props.entryState.endTime2 !== undefined)
    if (!props.entryState.location || missing2ndLoc) {
      setErrMsg('Locations cannot be blank')
      return true
    }

    setErrMsg(undefined)
    return false
  }

  const handleSubmit = () => {
    //check if there are too many entries
    const errors = check_for_errors()
    if (errors) return
    const entries = state_to_entries(props.entryState)
    for (let idx = 0; idx < entries.length; idx++) {
      const entry = entries[idx]
      if (props.edit) {
        edit_entry_by_id(props.entryState.entryId as number, entry)
          .then((response: any) => {
            console.log('response', response)
          })
          .finally(() => {
            setOpen(false)
            props.handleEntrySubmit()
          })
      }
      else {
        add_entry(entry)
          .then((response: any) => {
            console.log('response', response)
          })
          .finally(() => {
            setOpen(false)
            props.setAnchorEl && props.setAnchorEl(null)
            props.handleEntrySubmit()
          })
      }
    }

  }

  return (
    <div>
      <Button style={{ margin: '12px' }} variant="contained" onClick={handleClickOpen}>
        {props.edit ? 'Edit entry' : 'Create New Entry'}
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
          {errMsg && (
            <Typography sx={{ color: 'red' }} variant="caption">{errMsg}</Typography>
          )}
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