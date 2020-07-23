// import app from 'firebase/app';
 
// const config = {
//   apiKey: process.env.REACT_APP_apiKey,
//   authDomain:process.env.REACT_APP_authDomain,
//   databaseURL: process.env.REACT_APP_databaseURL,
//   projectId:  process.env.REACT_APP_projectId,
//   storageBucket:  process.env.REACT_APP_storageBucket,
//   messagingSenderId: process.env.REACT_APP_messagingSenderId,
//   appId: process.env.REACT_APP_appId,
//   measurementId: process.env.REACT_APP_measurementId
// };
 
// class Firebase {
//   static _firebase = null

//   static getInstance() {
//     if (!Firebase._firebase) {
//       Firebase._firebase = new Firebase()
//     }
//     return Firebase._firebase;
//   }

//   constructor() {
//     app.initializeApp(config);
//   }

//   init() {
//     console.log(' Firebase Initialized ')
//   }
// }
 
// export default Firebase;

import * as firebase from "firebase";

const config= {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain:process.env.REACT_APP_authDomain,
  databaseURL: process.env.REACT_APP_databaseURL,
  projectId:  process.env.REACT_APP_projectId,
  storageBucket:  process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId
};
console.log('------------', firebase.apps.length, firebase.initializeApp(config) , firebase.app())
export default !firebase.apps.length ? firebase.initializeApp(config, 'SocialAuth') : firebase.app();