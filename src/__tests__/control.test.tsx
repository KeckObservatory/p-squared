import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Control } from '../control';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter } from 'react-router-dom';

test('renders Control component and makes sure top buttons exist', () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Control />
      </QueryParamProvider>
    </BrowserRouter>,
  );
  const linkElement = screen.getByText(/Create New Entry/);
  expect(linkElement).toBeInTheDocument();

  const linkElement2 = screen.getByText(/Create Summit Shifts/);
  expect(linkElement2).toBeInTheDocument();
});

test('Checks that date input exists', async () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Control />
      </QueryParamProvider>
    </BrowserRouter>,
  );

  // Get and click in the date 
  const dateButton = await screen.findByLabelText(/date/i, { exact: false });
  expect(dateButton).toBeInTheDocument();
})

test('Checks that create entry button exists', async () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Control />
      </QueryParamProvider>
    </BrowserRouter>,
  );

  const newEntryButton = await screen.getByText(/create new entry/i)
  act(() => {
    userEvent.click(newEntryButton);
  })
  const submitButton = await screen.getByText(/submit/i)
  expect(submitButton).toBeInTheDocument();
})

test('Checks that create summit shifts entry exists', async () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Control />
      </QueryParamProvider>
    </BrowserRouter>,
  );

  const newShiftsButton = await screen.getByText(/create summit shifts/i)
  act(() => {
    userEvent.click(newShiftsButton);
  })
  const submitButton = await screen.getByText(/submit/i)
  expect(submitButton).toBeInTheDocument();
})

test('Checks that filter names exists', async () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Control />
      </QueryParamProvider>
    </BrowserRouter>,
  );

  const filterNamesText = await screen.findByLabelText(/filter names/i, { exact: false });
  expect(filterNamesText).toBeInTheDocument();
})
  
test('Checks that location input exists', async () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Control />
      </QueryParamProvider>
    </BrowserRouter>,
  );

  // const dropdownButton = screen.getByText(/location​/i, {exact: false });
  const dropdownButton = screen.getByRole("button", { name: /location/i, exact: false, hidden: true });
  userEvent.click(dropdownButton);

  // Get and click in the dropdown item
  const dropdownItem: any = await screen.getByText(/hq/i);
  userEvent.click(dropdownItem);

  // const linkElement = screen.getByTestId(/location-dropdown/)
  // // console.log(linkElement.childNodes[0].childNodes[0].childNodes[0])

  // userEvent.click(linkElement)

  // const dropdownItem: any = await screen.findByRole( "option", { name: /HQ/i })
  // userEvent.click(dropdownItem)

  const HQLocation = screen.getByText(/HQ/);
  expect(HQLocation).toBeInTheDocument();

});