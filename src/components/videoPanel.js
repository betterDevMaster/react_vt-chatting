import React, { useState, useEffect, useRef } from 'react';
import VideoCall from '../helpers/simple-peer';
import io from 'socket.io-client';
import Chat from './CustomChat';
import { serverAPI } from '../config'
import { SettingChat,MicOnIcon,MicOffIcon,CamOnIcon,CamOffIcon } from './Icons';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { JwModal } from './dialog';
import Profile from './dialog/profile'
  
const VideoPanel  = () => {
  // use refs for these vars so they exist outside of state
  // we initialise socket listeners on render, and the closure means stale state is referenced.
  // See https://stackoverflow.com/questions/54675523/state-inside-useeffect-refers-the-initial-state-always-with-react-hooks
  const roomid = localStorage.getItem('roomid')
  const peer = useRef({});
  const localStream = useRef({});
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [micState, setMicState] = useState(true)
  const [camState, setCamState] = useState(true)
  // this MUST be true for peer to signal
  const initiator = useRef(false);
  const [full, setFull] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [waiting, setWaiting] = useState(true)
  const [messages, setMessages] = useState([])
  const [partnerTyping, setPartnerTyping] = useState(false)

  const [socket, setSocket] = useState(io(process.env.REACT_APP_SIGNALING_SERVER))
  const [roomId, setRoomId] = useState(roomid)

  const videoCall = new VideoCall();
  const [remoteUser, serRemoteUser] = useState({})
  const setClientTyping = (typing) => socket.emit('typing', { typing, roomId });
  const preGender = parseInt(localStorage.getItem('gender'))
  const gender = (preGender === 1 ? 'Male' : preGender === 2 ? 'Female' : 'Unknown')
  const userSetting = localStorage.getItem('email')


  // component did mount
  useEffect(() => {    
    getUserMedia().then(() => {
      socket.emit('join', { roomId: roomId });
    });

    socket.on('init', () => {
      initiator.current = true;
    });

    socket.on('ready', () => {
      enter(roomId);
    });

    socket.on('desc', data => {
      if (data.type === 'offer' && initiator.current) return;
      if (data.type === 'answer' && !initiator.current) return;
      call(data);
    });

    socket.on('disconnected', () => {
      console.log('disconnect user-------')
      setMessages([])
      // socket.emit('newChatMessage', { message, 0, roomId });
      initiator.current = true;
    });

    socket.on('full', () => {
      setFull(true);
    });

    socket.on('newChatMessage',
      (message) => {
        setMessages(prev => prev.concat(message));
      }
    );

    socket.on('typing',
      ({ typing }) => {
        setPartnerTyping(typing)
      }
    );
  }, [])

  useEffect(() => {
    if (parseInt(localStorage.getItem('updateuser')) === 1) {
      toast.info('Remote user info updated!')
      localStorage.setItem('updateuser', 0)
    }
  }, [localStorage.getItem('updateuser')]);

  const getUserMedia = () => new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia = ( navigator.mediaDevices.getUserMedia ||
                        navigator.mediaDevices.webkitGetUserMedia ||
                        navigator.mediaDevices.mozGetUserMedia ||
                        navigator.mediaDevices.msGetUserMedia);
      const op = {
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 }
        },
        // require audio
        audio: true
      };
      navigator.mediaDevices.getUserMedia(op)
        .then(stream => {
          localStream.current = stream;
          localVideo.current.srcObject = stream;

          setAudioLocal()
          setVideoLocal()

          resolve();
        })
        .catch(err => console.log(err) || reject(err))
    });

  const enter = roomId => {
    setConnecting(true)

    const value = {
      roomId: roomId,
      userId: localStorage.getItem('userid')
    }
    getPeerUserInfo(value)

    const peerObject = videoCall.init(
      localStream.current,
      initiator.current
    );

    peerObject.on('signal', data => {
      console.log('peer signal')
      const signal = {
        room: roomId,
        desc: data
      };
      socket.emit('signal', signal);
    });

    peerObject.on('stream', stream => {
      remoteVideo.current.srcObject = stream;
      setConnecting(false);
      setWaiting(false);
    });

    peerObject.on('error', (err) => {
      setWaiting(true)
      console.log(err);
    });
    peer.current = peerObject;

  };

  const call = otherId => {
    videoCall.connect(otherId);
  };

  const renderFull = () => {
    if (full) {
      return <div className='room-full'>The room is full</div>;
    }
  };

  const setAudioLocal = () => {
    if(localStream.current.getAudioTracks().length>0){
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled=!track.enabled;
      });
    }
    setMicState(!micState)
  }

  const setVideoLocal = () => {
    if(localStream.current.getVideoTracks().length>0){
      localStream.current.getVideoTracks().forEach(track => {
        track.enabled=!track.enabled;
      });
    }
    setCamState(!camState)
  }

  const sendMessage = ({ message, type, roomId }) => {
    socket.emit('stoppedTyping', { typing: false })
    socket.emit('newChatMessage', { message, type, roomId });
  };

  const getPeerUserInfo = (value) => {
    const url = 'getPeerUserInfo'
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
      serRemoteUser(data.record)
    })
    .catch(err => console.log(err))
  }

  return (
    <div className='application--wrap'>
      {/* Video section */}
      <section className='video-wrapper' >
        <div className='headerBoard dashLine'>
          <h1 className='control-h2'>
            Videos
          </h1>
          <div>
            { userSetting !== 'null' &&
            <button
                className='control-btn'
                onClick={JwModal.open('profile')} 
            >
                <SettingChat/>
            </button> 
            }
            <button
              className='control-btn'
              onClick={() => {setAudioLocal()}}
            >
              {
                micState?(
                  <MicOnIcon/>
                ):(
                  <MicOffIcon/>
                )
              }
            </button>
            <button
              className='control-btn'
              onClick={() => {setVideoLocal()}}
            >
              {
                camState?(
                  <CamOnIcon/>
                ):(
                  <CamOffIcon/>
                )
              }
            </button>
          </div>
        </div>
        <div className='local-video-wrapper' >
          <div className='video-header'>
            <img
              className='video-avatar-img'
              src={localStorage.getItem('photo')}
              alt='icon avatar'
            />
            <div className='video-avatar-info'>
              <span className='video-avatar-info-name'>
                {localStorage.getItem('nickname')}
              </span>
              <span className='video-avatar-info-content'>
                {gender + '\t' + localStorage.getItem('age') + '\t' + localStorage.getItem('country')}
              </span>
            </div>
          </div>
          <video
            autoPlay
            className='video-content'
            muted
            ref={localVideo}
          />
        </div>
        <div className={`${
              connecting || waiting ? 'content-hide' : 'remote-video-wrapper'
            }`} >
          {remoteUser ? 
          (
          <div className='video-header'>
            <img
              className='video-avatar-img'
              src={remoteUser.photo}
              alt='icon avatar'
            />
            <div className='video-avatar-info'>
              <span className='video-avatar-info-name'>
                {remoteUser.nickname}
              </span>
              <span className='video-avatar-info-content'>
                { (remoteUser.gender === 1 ? 'Male' : remoteUser.gender === 2 ? 'Female' : 'Unknown')
                  + '\t' + remoteUser.age + '\t' + remoteUser.country}
              </span>
            </div>
          </div>
          )
          : null }
          <video
            autoPlay
            className='video-content'
            muted
            ref={remoteVideo}
          />
        </div>
        
        {connecting && waiting && (
          <div className='status'>
            <p>Establishing connection...</p>
          </div>
        )}
        {!connecting && waiting && (
          <div className='status'>
            <p>Waiting for someone...</p>
          </div>
        )}
        {renderFull()}
      </section>

      {/* Chat section */}
      <section className='chat-wrapper' >
        {socket && <Chat
          clientId={socket.id}
          roomId={roomId}
          toast={toast}
          sendMessage={sendMessage}
          messages={messages}
          setClientTyping={setClientTyping}
          partnerTyping={partnerTyping}
        /> }
      </section>
      <ToastContainer
        position="top-right"
        autoClose={7000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={true}
      />
      <JwModal id="profile">
        <Profile />
      </JwModal>
    </div>
    );
}


export default VideoPanel;
  