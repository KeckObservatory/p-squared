import React from 'react'
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useQueryParam } from 'use-query-params';

interface Props { }

const TopBar = (props: Props) => {

    const [userName, setUserName] = useQueryParam('userName')
    return (
        <AppBar position='relative'>
            <Toolbar>
                <Typography>People Planner: Logged in as {userName as string}</Typography>
            </Toolbar>
        </AppBar>
    )
}

export default TopBar