import React, { Component } from 'react';
import './App.css';
import './styles/video.css'
import { BrowserRouter, Route } from 'react-router-dom';

import Login from './components/login';
import Dashboard from './components/dashboard';
import GoToRoomInput from './components/goToRoomInput';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          {/* <Route path="/" exact component={GoToRoomInput}/> */}
          <Route path="/" exact component={Login}/>
          <Route path="/:roomId" exact component={Dashboard}/>
        </React.Fragment>
      </BrowserRouter>
    )
  }
}

export default App;
