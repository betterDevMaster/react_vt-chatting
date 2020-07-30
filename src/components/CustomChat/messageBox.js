import React, { useState } from 'react';
import ReactLoading from 'react-loading'
import moment from 'moment'
import { ImageUpload, GifUpload, EmojiUpload, MessageSend } from '../Icons';
import images from '../Themes/Images'
import {AppString} from '../Const'

const MessageBox = ({ onSendMessage, setClientTyping }) => {
  const [message, setMessage] = useState('');
  const [isShowSticker, setIsShowSticker] = useState(false)
  const [refInput, setRefInput] = useState()
  const [isLoading, setIsLoading] = useState(false)
  var currentPhotoFile = null

  const renderStickers = () => {
    return (
      <div className="viewStickers">
          <img
              className="imgSticker"
              src={images.mimi1}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi1', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi2}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi2', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi3}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi3', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi4}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi4', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi5}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi5', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi6}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi6', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi7}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi7', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi8}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi8', 2)}
          />
          <img
              className="imgSticker"
              src={images.mimi9}
              alt="sticker"
              onClick={() => onPreSendMessage('mimi9', 2)}
          />
      </div>
    )
  }
  const onPreSendMessage = (text, type) => {
    if (type === 1) {
      setIsLoading(false)
    }
    if (type === 2) {
      setIsShowSticker(false)
    }
    onSendMessage(text, type)
    setMessage('')
  }
  const openListSticker = () => {
    setIsShowSticker(!isShowSticker)
  }
  const onChoosePhoto = event => {
    if (event.target.files && event.target.files[0]) {
        setIsLoading(true)
        let reader = new FileReader();

        reader.onloadend = () => {
          onPreSendMessage(reader.result, 1)
        }
        reader.readAsDataURL(event.target.files[0])
    } else {
      setIsLoading(false)
    }
  }

  const onKeyboardPress = (event) => {
      if (event.key === 'Enter') {
        if (!event.shiftKey){
          onPreSendMessage(message, 0)
        }
      }
  }

  return (
    <>
      <div className="chat-bottom">
        <button
          className='control-btn'
          onClick={() => refInput.click() }
        >
            <ImageUpload />
        </button>
        <input
            ref={el => { setRefInput(el) }}
            accept="image/*"
            className="chat-bottom-gallery"
            type="file"
            onChange={onChoosePhoto}
        />
        <button
          className='control-btn'
          onClick={openListSticker}
        >
            <GifUpload />
        </button>
        <input
            className="chat-bottom-input"
            placeholder="Start a new message..."
            value={message}
            onChange={event => {
              setMessage(event.target.value)
            }}
            onKeyPress={onKeyboardPress}
        />
        <button
          className='control-btn'
          onClick={() => {
            onPreSendMessage(message, 0)
          }}
        >
            <MessageSend />
        </button>
      </div>
      {isShowSticker ? renderStickers() : null}

      {/* Loading */}
      {isLoading ? (
          <div className="viewLoading">
              <ReactLoading
                  type={'spin'}
                  color={'#203152'}
                  height={'3%'}
                  width={'3%'}
              />
          </div>
      ) : null}
    </>
  )
}

export default MessageBox;