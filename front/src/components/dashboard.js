import React, { useState, useEffect, useRef } from 'react';
import VideoPanel from './videoPanel';
import ChatPanel from './chatPanel';
import '../styles/dashboard.css'

class Dashboard extends React.Component {
  constructor() {
    super()
  }

  componentDidMount() {
    console.log('props---------', this.props)  
  }

  render() {
    return (
      <main className="css-1dbjc4n r-1habvwh r-16y2uox r-1wbh5a2">
        <div className="css-1dbjc4n r-150rngu r-16y2uox r-1wbh5a2 r-rthrr5">
          <div className="css-1dbjc4n r-1pz39u2 r-1p0dtai r-13awgt0 r-18u37iz r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1xnzce8">
            <VideoPanel params={this.props.match.params} />
            <ChatPanel />
          </div>
        </div>
      </main>
    )
  }
}

export default Dashboard