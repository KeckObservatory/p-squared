import React from 'react'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'

export const Calendar = () => {
    return (
      <FullCalendar
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
        initialView="dayGridMonth"
        plugins={[ dayGridPlugin, timeGridPlugin ]}
      />
    )
  }
