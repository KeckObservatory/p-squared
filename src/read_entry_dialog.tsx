import React from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from "@mui/material/Button";
import { Entry, EntryData, Item } from "./p_timeline_utils";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { ALL_LOCATIONS } from "./control";

interface Props {
    entry: EntryData
}

export const ReadEntryDialog = (props: Props) => {

    const [open, setOpen] = React.useState(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const locations: Partial<EntryData> = {}

    console.log('selected Entry', props.entry)
    ALL_LOCATIONS.map((loc: string) => {
        const value = props.entry[loc as keyof EntryData]
        if (value) {
            locations[loc as keyof EntryData] = value as any
        }
    })

    React.useEffect(() => {


    }, [])


    const handleClickOpen = async () => {
        console.log('entry to be readonly', props.entry)
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button style={{ margin: '12px' }} variant="contained" onClick={handleClickOpen}>
                {'Read Entry'}
            </Button>
            <Dialog
                sx={{ paddingTop: '3px' }}
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    {'Read Entry'}
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                    >
                        <TextField
                            label="Name"
                            defaultValue={props.entry.Name}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Department"
                            defaultValue={props.entry.Department}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Basecamp"
                            defaultValue={props.entry.BaseCamp}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Staff"
                            defaultValue={props.entry.Staff}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Date"
                            defaultValue={JSON.stringify(props.entry.Date).replace(',', '')}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Last Modification Date"
                            defaultValue={props.entry.LastModification}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        {
                            Object.entries(locations).map(([key, val]: [string, any]) => {
                                const dateRange = JSON.parse(val)

                                return (
                                    <React.Fragment>
                                        <TextField
                                            label={`${key} Start Time`}
                                            defaultValue={dateRange[0]}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                        <TextField
                                            label={`${key} End Time`}
                                            defaultValue={dateRange[1]}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </React.Fragment>
                                )
                            })
                        }
                        <TextField
                            label="Alternate Pickup Location"
                            defaultValue={props.entry.AlternatePickup}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Summit Lead"
                            defaultValue={props.entry.SummitLead}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Support Lead"
                            defaultValue={props.entry.SupportLead}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Additional Seats"
                            defaultValue={props.entry.Seats}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            label="Last Modification Date"
                            defaultValue={props.entry.LastModification}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )

}