import React, { Component } from 'react';
import './App.css';
import './styles/video.css'
import { BrowserRouter, Route } from 'react-router-dom';

import Login from './components/login';
import Video from './components/videoPanel';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <Route path="/" exact component={Login}/>
          <Route path="/:roomId" exact component={Video}/>
        </React.Fragment>
      </BrowserRouter>
    )
  }
}

export default App;
