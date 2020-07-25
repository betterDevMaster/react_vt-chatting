import React, { useState, useEffect, useRef } from 'react';
import VideoPanel from './videoPanel';
import ChatBoard from './ChatBoard/ChatBoard'
// import './ChatBoard/ChatBoard.css'
import '../styles/dashboard.css'

class Dashboard extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <main className="baseBoard r-1habvwh r-16y2uox r-1wbh5a2">
        <div className="baseBoard r-150rngu r-16y2uox r-1wbh5a2 r-rthrr5">
          <div className="baseBoard r-1pz39u2 r-1p0dtai r-13awgt0 r-18u37iz r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-1xnzce8">
            <VideoPanel params={this.props.match.params} />
            {/* <ChatPanel /> */}
            <ChatBoard params={this.props} />
          </div>
        </div>
      </main>
    )
  }
}

export default Dashboard