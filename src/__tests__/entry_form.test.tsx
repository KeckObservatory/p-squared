import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Control } from '../control';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter } from 'react-router-dom';
import { EntryForm } from '../entry_form';
import { default as mock_employees } from '../employees.json'

// test('renders Control component and makes sure top buttons exist', () => {

//   const props = {
//     edit: false,
//     employees: mock_employees,
//     entryState: {
//       location: "",
//       staff: "ttester",
//       alias: "ttester",
//       dateRange: [new Date(), new Date()] as [Date | string, Date | string],
//       startHour: 8,
//       endHour: 17
//     },
//     setEntryState: (state: any) => { }
//   }
//   render(
//     <EntryForm {...props} />
//   );
//   const submitButton = screen.getByText(/submit/i)
//   expect(submitButton).toBeInTheDocument();
//   // act(() => {
//   //   userEvent.click(submitButton);
//   // })
//   // const errorElement = screen.getByText(/locations cannot be blank/i);
//   // expect(errorElement).toBeInTheDocument();
// });
