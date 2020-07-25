import React, { useState, useEffect, useRef } from 'react';
import VideoCall from '../helpers/simple-peer';
import io from 'socket.io-client';
import { getDisplayStream } from '../helpers/media-access';
import { ShareScreenIcon,MicOnIcon,MicOffIcon,CamOnIcon,CamOffIcon } from './Icons';

import '../styles/dashboard.css'

class VideoPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      localStream: {},
      remoteStreamUrl: '',
      streamUrl: '',
      initiator: false,
      peer: {},
      full: false,
      connecting: false,
      waiting: true,
      micState:true,
      camState:true,
    };
  }
  videoCall = new VideoCall();

  componentDidMount() {
    const socket = io(process.env.REACT_APP_SIGNALING_SERVER);
    const component = this;
    this.setState({ socket });
    const { roomId } = this.props.params;
    this.getUserMedia().then(() => {
      socket.emit('join', { roomId: roomId });
    });

    socket.on('init', () => {
      component.setState({ initiator: true });
    });
    socket.on('ready', () => {
      component.enter(roomId);
    });
    socket.on('desc', data => {
      if (data.type === 'offer' && component.state.initiator) return;
      if (data.type === 'answer' && !component.state.initiator) return;
      component.call(data);
    });
    socket.on('disconnected', () => {
      component.setState({ initiator: true });
    });
    socket.on('full', () => {
      component.setState({ full: true });
    });
  }


  getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      const op = {
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 }
        },
        audio: true
      };
      navigator.getUserMedia(
        op,
        stream => {
          this.setState({ streamUrl: stream, localStream: stream });
          this.localVideo.srcObject = stream;
          resolve();
        },
        () => {}
      );
    });
  }

  setAudioLocal(){
    if(this.state.localStream.getAudioTracks().length>0){
      this.state.localStream.getAudioTracks().forEach(track => {
        track.enabled=!track.enabled;
      });
    }
    this.setState({
      micState:!this.state.micState
    })
  }

  setVideoLocal(){
    if(this.state.localStream.getVideoTracks().length>0){
      this.state.localStream.getVideoTracks().forEach(track => {
        track.enabled=!track.enabled;
      });
    }
    this.setState({
      camState:!this.state.camState
    })
  }

  // getDisplay() {
  //   getDisplayStream().then(stream => {
  //     stream.oninactive = () => {
  //       this.state.peer.removeStream(this.state.localStream);
  //       this.getUserMedia().then(() => {
  //         this.state.peer.addStream(this.state.localStream);
  //       });
  //     };
  //     this.setState({ streamUrl: stream, localStream: stream });
  //     this.localVideo.srcObject = stream;
  //     this.state.peer.addStream(stream);
  //   });
  // }

  enter = roomId => {
    this.setState({ connecting: true });
    const peer = this.videoCall.init(
      this.state.localStream,
      this.state.initiator
    );
    this.setState({ peer });

    peer.on('signal', data => {
      const signal = {
        room: roomId,
        desc: data
      };
      this.state.socket.emit('signal', signal);
    });
    peer.on('stream', stream => {
      this.remoteVideo.srcObject = stream;
      this.setState({ connecting: false, waiting: false });
    });
    peer.on('error', function(err) {
      console.log(err);
    });
  };

  call = otherId => {
    this.videoCall.connect(otherId);
  };
  renderFull = () => {
    if (this.state.full) {
      return 'The room is full';
    }
  };

  render() {
    return (
      <div className="baseBoard r-18bvks7 r-1ljd8xs r-13l2t4g r-1phboty r-13awgt0 r-1jgb5lz r-1ye8kvj r-1udh08x r-13qz1uu">
        <div className="headerChatBoard">
          <h2 aria-level="2" dir="ltr" className="css-4rbku5 css-901oao css-bfa6kz r-jwli3a r-1qd0xha r-1vr29t4 r-bcqeeo" id="root-header">
            <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">Videos</span>
          </h2>
          <div className='viewBottom'>
            {/* <button
              className='control-btn'
              onClick={() => {
                this.getDisplay();
              }}
            >
              <ShareScreenIcon />
            </button> */}
            <button
              className='control-btn'
              onClick={() => {
                this.setAudioLocal();
              }}
            >
              {
                this.state.micState?(
                  <MicOnIcon/>
                ):(
                  <MicOffIcon/>
                )
              }
            </button>
            <button
              className='control-btn'
              onClick={() => {
                this.setVideoLocal();
              }}
            >
              {
                this.state.camState?(
                  <CamOnIcon/>
                ):(
                  <CamOffIcon/>
                )
              }
            </button>
          </div>
        </div>
        <div className="baseBoard r-1pz39u2 r-13awgt0">
          <div className='video-wrapper'>
            <div className='local-video-wrapper'>
              <div className="headerChatBoard avatarBoard">
                  <img
                    className="viewAvatarItem"
                    src="https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png"
                    alt="icon avatar"
                  />
                  <div className="baseBoard">
                    <span className="textHeaderChatBoard">
                      John
                    </span>
                    <span className="textHeaderChatBoard">
                      Male 33 Colombia
                    </span>
                  </div>
              </div>
              <video
                autoPlay
                id='localVideo'
                muted
                ref={video => (this.localVideo = video)}
              />
            </div>


            <div id='remoteVideo' className={`${
                this.state.connecting || this.state.waiting ? 'hide' : ''
              }`}  >
              <div className="headerChatBoard avatarBoard">
                  <img
                    className="viewAvatarItem"
                    src="https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png"
                    alt="icon avatar"
                  />
                  <div className="baseBoard">
                    <span className="textHeaderChatBoard">
                      John
                    </span>
                    <span className="textHeaderChatBoard">
                      Male 33 Colombia
                    </span>
                  </div>
              </div>
            </div>
            
            <video
              autoPlay
              className={`${
                this.state.connecting || this.state.waiting ? 'hide' : ''
              }`}
              id='remoteVideo'
              ref={video => (this.remoteVideo = video)}
            />

            {this.state.connecting && (
              <div className='status'>
                <p>Establishing connection...</p>
              </div>
            )}
            {this.state.waiting && !this.state.connecting && (
              <div className='status'>
                <p>Waiting for someone...</p>
              </div>
            )}
            {this.renderFull()}
          </div>
        </div>
      </div>
    )
  }
}

export default VideoPanel;