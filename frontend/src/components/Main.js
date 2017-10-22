import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Election from './Election';

function Main() {
  return (
    <BrowserRouter>
      <Route path="/elections/:realm/:slug" component={Election} />
    </BrowserRouter>
  );
}

export default Main;
