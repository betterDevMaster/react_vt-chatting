import React, { useState } from 'react'
import shortId from 'shortid'

const goToRoom = (history, roomId) => {
  // history.push(`/dashboard/${roomId}`)
  history.push(`/${roomId}`)
}


export default function GoToRoomInput({history}) {
  let [roomId, setRoomId] = useState(shortId.generate());

  // localStorage.setItem(AppString.ID, user.uid)
  // localStorage.setItem(AppString.NICKNAME, user.displayName)
  // localStorage.setItem(AppString.PHOTO_URL, user.photoURL)

  return (
    <div className="enter-room-container">
      <form>
        <input type="text" value={roomId} placeholder="Room id" onChange={(event) => {
          setRoomId(event.target.value)
        }}/>
        <button onClick={() => {
          goToRoom(history, roomId)
        }}>Enter</button>
        </form>
    </div>
  )
}