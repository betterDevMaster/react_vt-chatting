import React, { Component } from 'react';
import './App.css';
import './styles/video.css'
import { BrowserRouter, Route } from 'react-router-dom';

import Dashboard from './components/dashboard';
import Video from './components/video'
import GoToRoomInput from './components/goToRoomInput';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <Route path="/" exact component={GoToRoomInput}/>
          {/* <Route path="/dashboard/:roomId" exact component={Dashboard}/> */}
          {/* <Route path="/dashboard" exact component={Dashboard}/> */}
          {/* <Route path="/roomInput" exact component={GoToRoomInput}/> */}
          {/* <Route path="/:roomId" exact component={Video}/> */}
          <Route path="/:roomId" exact component={Dashboard}/>
        </React.Fragment>
      </BrowserRouter>
    )
  }
}

export default App;
