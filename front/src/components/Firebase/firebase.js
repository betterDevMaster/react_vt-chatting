import app from 'firebase/app';
import 'firebase/auth';
 
const config = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain:process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId:  process.env.REACT_APP_projectId,
    storageBucket:  process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
    measurementId: process.env.REACT_APP_measurementId
};
 
class Firebase {
    static _firebase = null

    static getInstance() {
        if (!Firebase._firebase) {
            Firebase._firebase = new Sqlite()
        }
        return Firebase._firebase;
     }

    constructor() {
        app.initializeApp(config);
    
        this.auth = app.auth();
    }
    // *** Auth API ***
    init() {
        console.log(' Firebase initialize. ')
    }
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();
    
    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);
}
 
export default Firebase;