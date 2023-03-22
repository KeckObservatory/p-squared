import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { BrowserRouter } from 'react-router-dom';

test('renders App test p-squared ', () => {
  render(
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <App />
      </QueryParamProvider>
    </BrowserRouter>,
  );
  const linkElement = screen.getByText(/Create New Entry/);
  expect(linkElement).toBeInTheDocument();

  const linkElement2 = screen.getByText(/Create Summit Shifts/);
  expect(linkElement2).toBeInTheDocument();
});