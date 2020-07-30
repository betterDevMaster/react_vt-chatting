// import React, { useState, useEffect, useRef } from 'react';
// import '../styles/chat.css';
// import io from 'socket.io-client';
// import Chat from './CustomChat';
  
// const ChatPanel  = ({ params }) => {
//   // use refs for these vars so they exist outside of state
//   // we initialise socket listeners on render, and the closure means stale state is referenced.
//   // See https://stackoverflow.com/questions/54675523/state-inside-useeffect-refers-the-initial-state-always-with-react-hooks
  
//   const peer = useRef({});
//   const localStream = useRef({});
//   const localVideo = useRef();
//   const remoteVideo = useRef();
//   // this MUST be true for peer to signal
//   const initiator = useRef(false);
//   const [full, setFull] = useState(false)
//   const [connecting, setConnecting] = useState(false)
//   const [waiting, setWaiting] = useState(true)
//   const [messages, setMessages] = useState([])
//   const [partnerTyping, setPartnerTyping] = useState(false)

//   const [socket, setSocket] = useState(io(process.env.REACT_APP_SIGNALING_SERVER))
//   const [roomId, setRoomId] = useState(params);

//   // component did mount
//   useEffect(() => {
//     getUserMedia().then(() => {
//       socket.emit('join', { roomId: roomId });
//     });

//     socket.on('init', () => {
//       initiator.current = true;
//     });
//     socket.on('ready', () => {
//       enter(roomId);
//     });
//     socket.on('disconnected', () => {
//       initiator.current = true;
//     });

//     socket.on('full', () => {
//       setFull(true);
//     });

//     socket.on('newChatMessage',
//       (message) => {
//         setMessages(prev => prev.concat(message));
//       }
//     );

//     socket.on('typing',
//       ({ typing }) => {
//         setPartnerTyping(typing)
//       }
//     );
//   }, [])


//   const getUserMedia = () => new Promise((resolve, reject) => {
//       navigator.mediaDevices.getUserMedia = ( navigator.mediaDevices.getUserMedia ||
//                         navigator.mediaDevices.webkitGetUserMedia ||
//                         navigator.mediaDevices.mozGetUserMedia ||
//                         navigator.mediaDevices.msGetUserMedia);
//       const op = {
//         video: {
//           width: { min: 160, ideal: 640, max: 1280 },
//           height: { min: 120, ideal: 360, max: 720 }
//         },
//         // require audio
//         audio: true
//       };
//       navigator.mediaDevices.getUserMedia(op)
//         .then(stream => {
//           localStream.current = stream;
//           resolve();
//         })
//         .catch(err => console.log(err) || reject(err))
//     });

//   const enter = roomId => {
//     setConnecting(true)
    
//     const peerObject = videoCall.init(
//       localStream.current,
//       initiator.current
//     );

//     peerObject.on('signal', data => {
//       console.log('peer signal')
//       const signal = {
//         room: roomId,
//         desc: data
//       };
//       socket.emit('signal', signal);
//     });

//     peerObject.on('stream', stream => {
//       setConnecting(false);
//       setWaiting(false);
//     });

//     peerObject.on('error', (err) => {
//       console.log(err);
//     });
//     peer.current = peerObject;

//   };

//   const sendMessage = ({ message, roomId }) => {
//     socket.emit('stoppedTyping', { typing: false })
//     socket.emit('newChatMessage', { message, roomId });
//   };

//   const setClientTyping = (typing) => socket.emit('typing', { typing, roomId });

//   return (
//     <div className='chat-wrapper' style={{ background: 'white' }}>
//       {socket && <Chat
//         clientId={socket.id}
//         roomId={roomId}
//         sendMessage={sendMessage}
//         messages={messages}
//         setClientTyping={setClientTyping}
//         partnerTyping={partnerTyping}
//       /> }
//     </div>
//     );
// }


// export default ChatPanel;
  