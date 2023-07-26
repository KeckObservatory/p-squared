import React from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { get_entry_by_id } from './api'
import Button from "@mui/material/Button";

interface Props {
    entryId?: number,
    handleCloseDialog: Function
}

export const ReadEntryDialog = (props: Props) => {

    const [open, setOpen] = React.useState(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    React.useEffect(() => {

    }, [])


    const handleClickOpen = async () => {

        const entry = props.entryId ? await get_entry_by_id(props.entryId) : {}
        console.log('entry to be readonly', entry)
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