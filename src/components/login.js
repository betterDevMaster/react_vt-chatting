import React, { useState } from 'react';
import Utils from './utils/position'
import shortId from 'shortid'

function Login(props){
    const [roomId, setRoomId] = useState(shortId.generate());
    
    const fname = React.useRef();
    const email = React.useRef();
    const age = React.useRef();
    const gender = React.useRef();
    const sign = React.useRef();
    const pass = React.useRef();
    const nickname = React.useRef();
    const rmbr = React.useRef();
     
    const handleLogin = (e) => {
        console.log(e.target.innerHTML.toLowerCase())
        console.log(sign.current.value, pass.current.value);
        console.log(fname.current.value, email.current.value, age.current.value, gender.current.value);
        // window.location.href = `/${roomId}`
    }

    const handleReset = (e) => {
        console.log(e.target.innerHTML.toLowerCase())
        console.log(rmbr.current.value, nickname.current.value);
        // window.location.href = `/${roomId}`
    }
    return (
        <section>
            <div>
                <div>
                    <div className="box ltr">
                        <div className="logo">
                            Video/Text Chat
                        </div>
                        <div className="swithlogin">
                            <ul>
                                <li className="active">Login</li>
                                <li className="lag">Login as Guest</li>
                            </ul>
                        </div>
                        <form autoComplete="off" className="gr_sign">
                            <div className="elements">
                                <input type="hidden" name="act" value="1" />
                                <input type="hidden" name="do" className="doz" value="login" />
                                <div className="register d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text"  name="fname" placeholder="Full Name" ref={fname} />
                                    </label>
                                    <label><i className="gi-mail"></i>
                                        <input type="email"  name="email" placeholder="Email Address" ref={email}/>
                                    </label>
                                    {/* <label><i className="gi-globe"></i>
                                        <input type="text"  name="name" placeholder="Username" />
                                    </label> */}
                                    <label><i className="gi-male"></i>
                                        <input type="number" className="gstdep"  name="age" placeholder="Age" ref={age} />
                                    </label>
                                    <div className="gender">
                                        <div>
                                            <input type="radio" id="male" name="gender" value="Male" defaultChecked ref={gender}/> 
                                            <span>Male</span>
                                        </div>
                                        <div>
                                            <input type="radio" id="female" name="gender" value="Female" ref={gender} />
                                            <span>Female</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="loginasguest d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="grnickname" className="nickname" name="nickname" placeholder="Nickname" ref={nickname} />
                                    </label>
                                </div>
                                <div className="login">
                                    <label><i className="gi-user"></i>
                                        <input type="text"  name="sign" placeholder="Email/Username" ref={sign} />
                                    </label>
                                </div>
                                <div className="global">
                                    <label><i className="gi-lock"></i>
                                        <input type="password" className="gstdep"  name="pass" placeholder="Password" ref={pass} />
                                    </label>
                                    
                                    
                                </div>
                            </div>
                            <div className="regsep d-none"></div>
                            <div className="sub">
                                <span className="rmbr"><i><b></b><input type="hidden" name="rmbr" ref={rmbr} /></i> Remember Me</span>
                                <span className="doer" data-do="forgot">Forgot Password</span>
                            </div>
                            <div className="submitbtns">
                                <span className="submit global" form=".gr_sign" do="login" btn="Register" em="Invalid Input or Field Empty" gst="1" dlg="Login" onClick={(e) =>handleLogin(e)} >Login</span>
                                <span className="submit reset d-none" form=".gr_sign" do="login" gst="1" em="Invalid Input or Field Empty" gst="1" onClick={(e) =>handleReset(e)} >Reset</span>
                            </div>
                            <div className="switch" qn="Already have an account?" btn="Login">
                                <i>Don't have an account?</i>
                                <span>Create</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )

}
export default Login;