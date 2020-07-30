import React, { useState, useEffect, useRef } from 'react';
import VideoPanel from './videoPanel';
import ChatPanel from './chatPanel'
// import './ChatBoard/ChatBoard.css'
import '../styles/dashboard.css'

class Dashboard extends React.Component {
  constructor() {
    super()
    this.state = {
      exit: false
    }
  }

  handleExit = () => {
    console.log('handleExit')
    this.setState({ exit: true })
  }
  render() {
    return (
      <main className="baseBoard">
        <VideoPanel params={this.props.match.params} /* exit={this.exit} */ />
        <ChatPanel params={this.props.match.params} onExitFromRoom={this.handleExit}/>
      </main>
    )
  }
}

export default Dashboard
