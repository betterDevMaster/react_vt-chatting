import React from 'react';
import ReactSpinner from 'react-spinkit'
import ScrollToBottom from 'react-scroll-to-bottom';
import '../../styles/chat.css';
import images from '../Themes/Images'

const Messages = ({ messages, clientId, partnerTyping }) => {
  const getGifImage = value => {
    switch (value) {
        case 'mimi1':
            return images.mimi1
        case 'mimi2':
            return images.mimi2
        case 'mimi3':
            return images.mimi3
        case 'mimi4':
            return images.mimi4
        case 'mimi5':
            return images.mimi5
        case 'mimi6':
            return images.mimi6
        case 'mimi7':
            return images.mimi7
        case 'mimi8':
            return images.mimi8
        case 'mimi9':
            return images.mimi9
        default:
            return null
    }
  }

  const messageText = (sender, text, key) => {
    return (
      <p 
        key={'text' + key} 
        className={`message ${clientId === sender ? 'my-message' : 'their-message'}`}>
          {text}
      </p>
    )
  }
  
  const messageGif = (sender, text, key) => { 
    return (
      <img
        key={'gif' + key + 5000} 
        className={`${clientId === sender ? 'my-message-gif' : 'their-message-gif'}`}
        src={getGifImage(text)}
        alt="content message"
      />
    )
  }
  
  const messageImage = (sender, text, key) => { 
    return (
      <img
        key={'image' + key + 10000} 
        className={`${clientId === sender ? 'my-message-image' : 'their-message-image'}`}
        src={text}
        alt="content message"
      />
    )
  }

  return (
    <ScrollToBottom className='messages'>
      {messages.map((message, key) => 
        (
          <>
            { 
              message.type === 0 ? messageText(message.sender, message.text, key) :
              message.type === 1 ? (
                messageImage(message.sender, message.text, key)
              ) : messageGif(message.sender, message.text, key)
            }
          </>
        )
      )}
      {partnerTyping &&  
        <ReactSpinner name='three-bounce' className='spinner-sender' /> 
      }
    </ScrollToBottom>
  )
}

export default Messages;