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
      <div className="css-1dbjc4n r-18bvks7 r-1ljd8xs r-13l2t4g r-1phboty r-13awgt0 r-1jgb5lz r-1ye8kvj r-1udh08x r-13qz1uu">
        <div className="css-1dbjc4n r-aqfbo4 r-gtdqiz r-ipm5af r-184en5c">
          <div className="css-1dbjc4n r-1h3ijdo r-136ojw6">
            <div className="css-1dbjc4n">
              <div className="css-1dbjc4n r-yfoy6g r-o4zss7 r-rull8r r-qklmqi r-1h3ijdo r-1j3t67a">
                <div className="css-1dbjc4n r-1awozwy r-18u37iz r-1h3ijdo r-1777fci r-1jgb5lz r-sb58tz r-13qz1uu">
                  <div className="css-1dbjc4n r-16y2uox r-1wbh5a2 r-1pi2tsx r-1777fci">
                    <div className="css-1dbjc4n r-1habvwh">
                      <h2 aria-level="2" dir="ltr" className="css-4rbku5 css-901oao css-bfa6kz r-jwli3a r-1qd0xha r-1b6yd1w r-1vr29t4 r-ad9z0x r-bcqeeo r-qvutc0" id="root-header">
                        <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">Messages</span>
                      </h2>
                    </div>
                  </div>
                  <div className="css-1dbjc4n r-obd0qt r-1pz39u2 r-1777fci r-1joea0r r-1vsu8ta r-18qmn74">
                    <div className='controls'>
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="css-1dbjc4n r-1pz39u2 r-13awgt0">
        <div className='video-wrapper'>
          <div className='local-video-wrapper'>
            <div className="css-18t94o4 css-1dbjc4n r-1ila09b r-rull8r r-qklmqi r-1ny4l3l r-1j3t67a r-1w50u8q r-o7ynqc r-6416eg" >
              <div className="css-1dbjc4n r-18u37iz">
                <div className="css-1dbjc4n r-18kxxzh r-1h0z5md r-zso239" style={{flexBasis: '49px'}}>
                  <div className="css-1dbjc4n r-1wbh5a2 r-dnmrzs">
                    <a href="/john19800038" className="css-4rbku5 css-18t94o4 css-1dbjc4n r-sdzlij r-1loqt21 r-1adg3ll r-ahm1il r-1ny4l3l r-1udh08x r-o7ynqc r-6416eg r-13qz1uu">
                      <div className="css-1dbjc4n r-1adg3ll r-1udh08x" >
                        <div className="r-1adg3ll r-13qz1uu __web-inspector-hide-shortcut__" style={{paddingBottom: '100%'}}></div>
                        <div className="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu">
                          <div className="css-1dbjc4n r-sdzlij r-1p0dtai r-1mlwlqe r-1d2f490 r-1udh08x r-u8s1d r-zchlnj r-ipm5af r-417010">
                            <div className="css-1dbjc4n r-1niwhzg r-vvn4in r-u6sd8q r-4gszlv r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-13qz1uu r-1wyyakw" style={{backgroundImage: 'url(&quot;https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png&quot;)'}}></div>
                            <img className="css-9pa8cd" src="https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png" />
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
                <div className="css-1dbjc4n r-1iusvr4 r-16y2uox">
                  <div className="css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep">
                    <div className="css-1dbjc4n r-1wbh5a2 r-dnmrzs">
                      <a href="/john19800038" className="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-1wbh5a2 r-dnmrzs r-1ny4l3l" style={{textDecoration: 'none', color: '#fff'}}>
                        <div className="css-1dbjc4n r-1wbh5a2 r-dnmrzs r-1ny4l3l">
                          <div className="css-1dbjc4n r-1awozwy r-18u37iz r-dnmrzs">
                            <div dir="auto" className="css-901oao css-bfa6kz r-jwli3a r-1qd0xha r-a023e6 r-vw2c0b r-ad9z0x r-bcqeeo r-3s2u2q r-qvutc0">
                              <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">
                                <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">Me</span>
                              </span>
                            </div>
                            <div dir="auto" className="css-901oao r-jwli3a r-18u37iz r-1q142lx r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-qvutc0"></div>
                          </div>
                          <div className="css-1dbjc4n r-18u37iz r-1wbh5a2">
                            <div dir="ltr" className="css-901oao css-bfa6kz r-111h2gw r-18u37iz r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-qvutc0">
                              <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">@Me19800038</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
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
              this.state.connecting || this.state.waiting ? 'hide' : 'css-18t94o4 css-1dbjc4n r-1ila09b r-rull8r r-qklmqi r-1ny4l3l r-1j3t67a r-1w50u8q r-o7ynqc r-6416eg'
            }`}  >
            <div className="css-1dbjc4n r-18u37iz">
              <div className="css-1dbjc4n r-18kxxzh r-1h0z5md r-zso239" style={{flexBasis: '49px'}}>
                <div className="css-1dbjc4n r-1wbh5a2 r-dnmrzs">
                  <a href="/john19800038" className="css-4rbku5 css-18t94o4 css-1dbjc4n r-sdzlij r-1loqt21 r-1adg3ll r-ahm1il r-1ny4l3l r-1udh08x r-o7ynqc r-6416eg r-13qz1uu">
                    <div className="css-1dbjc4n r-1adg3ll r-1udh08x" >
                      <div className="r-1adg3ll r-13qz1uu __web-inspector-hide-shortcut__" style={{paddingBottom: '100%'}}></div>
                      <div className="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu">
                        <div className="css-1dbjc4n r-sdzlij r-1p0dtai r-1mlwlqe r-1d2f490 r-1udh08x r-u8s1d r-zchlnj r-ipm5af r-417010">
                          <div className="css-1dbjc4n r-1niwhzg r-vvn4in r-u6sd8q r-4gszlv r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-13qz1uu r-1wyyakw" style={{backgroundImage: 'url(&quot;https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png&quot;)'}}></div>
                          <img className="css-9pa8cd" src="https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="css-1dbjc4n r-1iusvr4 r-16y2uox">
                <div className="css-1dbjc4n r-1awozwy r-18u37iz r-1wtj0ep">
                  <div className="css-1dbjc4n r-1wbh5a2 r-dnmrzs">
                    <a href="/john19800038" className="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-1wbh5a2 r-dnmrzs r-1ny4l3l" style={{textDecoration: 'none', color: '#fff'}}>
                      <div className="css-1dbjc4n r-1wbh5a2 r-dnmrzs r-1ny4l3l">
                        <div className="css-1dbjc4n r-1awozwy r-18u37iz r-dnmrzs">
                          <div dir="auto" className="css-901oao css-bfa6kz r-jwli3a r-1qd0xha r-a023e6 r-vw2c0b r-ad9z0x r-bcqeeo r-3s2u2q r-qvutc0">
                            <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">
                              <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">king</span>
                            </span>
                          </div>
                          <div dir="auto" className="css-901oao r-jwli3a r-18u37iz r-1q142lx r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-qvutc0"></div>
                        </div>
                        <div className="css-1dbjc4n r-18u37iz r-1wbh5a2">
                          <div dir="ltr" className="css-901oao css-bfa6kz r-111h2gw r-18u37iz r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-bcqeeo r-qvutc0">
                            <span className="css-901oao css-16my406 r-1qd0xha r-ad9z0x r-bcqeeo r-qvutc0">@king19800038</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
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