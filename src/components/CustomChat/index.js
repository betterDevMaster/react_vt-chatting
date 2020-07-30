import React, { useState, useRef } from 'react';
import MessageBox from './messageBox';
import Messages from './messages';
import { JwModal } from '../dialog';
import { SettingChat, NextChat, ExitChat } from '../Icons';

const Chat = ({ props, messages, sendMessage, roomId, clientId, partnerTyping, setClientTyping }) => {
  const handleNext = () => {

  }

  const handleExit = () => {
    window.location.href = '/'
  }

  return (
    <>
      <div className='headerBoard dashLine'>
        <h2 className='control-h2'>
          Messages
        </h2>
        <div>
          <button
              className='control-btn'
              onClick={JwModal.open('profile')} 
          >
              <SettingChat/>
          </button>
          <button
              className='control-btn'
              onClick={handleNext}
          >
              <NextChat/>
          </button>
          <button
              className='control-btn'
              onClick={handleExit}
          >
              <ExitChat/>
          </button>
        </div>
      </div>
      {/* List message */}
      <div className="chat-content">
        <Messages messages={messages} clientId={clientId} partnerTyping={partnerTyping}/>
        <MessageBox
          props
          onSendMessage={ (message, type) => {
            sendMessage({ message, type, roomId });
          }}
          setClientTyping={setClientTyping}
          />
      </div>
    </>
  )
}

export default Chat;