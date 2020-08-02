import React, { useState, useRef, useEffect } from 'react';
import MessageBox from './messageBox';
import Messages from './messages';
// import Select from "react-dropdown-select";
import { JwModal } from '../dialog';
import { SearchRooms, IncreasePanel, DecreasePanel, SettingChat, NextChat, ExitChat } from '../Icons';
import SearchRoom from '../dialog/searchroom'
import Utils from '../utils/position'
import { serverAPI } from '../../config'

const Chat = ({ props, messages, sendMessage, roomId, clientId, partnerTyping, setClientTyping, toast }) => {
  const [decreaseLeftPanel, setDecreaseLeftPanel] = useState(true)
  // const userSetting = localStorage.getItem('email')

  const handleBack = (event) => {
    if (decreaseLeftPanel) {
      document.getElementsByClassName('video-wrapper')[0].style.display = 'none'
      document.getElementsByClassName('chat-wrapper')[0].style.paddingLeft = '0px'
      setDecreaseLeftPanel(false)
    } else {
      document.getElementsByClassName('video-wrapper')[0].style.display = 'block'
      if (Utils.width() > 900) {
        document.getElementsByClassName('chat-wrapper')[0].style.paddingLeft = '300px'
      } 
      // else {
      //   document.getElementsByClassName('chat-wrapper')[0].style.paddingLeft = '240px'
      // }
      setDecreaseLeftPanel(true)
    }
  }
  
  const Next = () => {
    async function handleCheck() {
      const value = {
        roomId: roomId,
        userId: localStorage.getItem('userid'),
        nickUser: localStorage.getItem('nickuser')
      }
  
      const newRoomId = await getAndSetServerData('setNextUser', value)
      // console.log('-------------',newRoomId)
      if (newRoomId) {
        localStorage.setItem('roomid', newRoomId)
        window.location.href = `/${newRoomId}`
      }
    };

    return (
      <div>
        Are you going to Leave this room? <button className='leave-room' onClick={handleCheck}>Yes</button>
      </div>
    );
  };

  const handleNext = () => {
    toast.info(<Next />)
  }

  const handleExit = () => {
    const value = {
      roomId: roomId,
      userId: localStorage.getItem('userid'),
      nickUser: localStorage.getItem('nickuser')
    }
    getAndSetServerData('setDisconnectUser', value)

    localStorage.clear();
    
    window.location.href = '/'
  }

  function getAndSetServerData(url, value) {
    return new Promise((resolve, reject) => {
      fetch(`${serverAPI}/${url}`, {
        method: 'post',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify(value)
      })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.status === 1) {
          resolve(data.newroom)
        } else if (data.status === 2) {
          toast.error(data.message)
        } else if (data.status === 3) {
          resolve(data.record)
        }
      })
      .catch(err => console.log(err))
    })
  }

  return (
    <>
      <div className='headerBoard dashLine'>
        <button
            className='control-btn decrease-panel'
            onClick={handleBack}
        >
          {decreaseLeftPanel ? <DecreasePanel/> : <IncreasePanel/>}
        </button>
        <h1 className='control-h2'>
          Messages
        </h1>
        <div className='header-control-btns' >
          {/* { userSetting !== 'null' &&
          <button
              className='control-btn'
              onClick={JwModal.open('profile')} 
          >
              <SettingChat/>
          </button> 
          } */}
          {/* <Select options={''} onChange={(values) => handleSearch(values)} /> */}

          <button
              className='control-btn'
              onClick={JwModal.open('searchRoom')} 
          >
              <SearchRooms/>
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
      <JwModal id="searchRoom">
        <SearchRoom />
      </JwModal>
    </>
  )
}

export default Chat;