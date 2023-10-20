import React from 'react'
import { AppBar, Button, Container, Toolbar, Typography } from '@mui/material';
import { useQueryParam } from 'use-query-params';
import { staff_logout } from './api';

interface Props { }

const TopBar = (props: Props) => {

    const [userName, setUserName] = useQueryParam('userName')

    const handleLogout = async () => {
        const resp = await staff_logout()
        console.log(resp)
        window.location.reload();
    }
    return (
        <AppBar position='relative'>
            <Toolbar>
                <Typography sx={{ flexGrow: 1 }}
                >People Planner: Logged in as {userName as string}</Typography>
                <Button
                    variant="contained"
                    onClick={handleLogout}
                >Logout</Button>
            </Toolbar>
        </AppBar>
    )
}

export default TopBar