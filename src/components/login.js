import React, { useState } from 'react';
import Utils from './utils/position'
import shortId from 'shortid'

function Login(props){
    const [roomId, setRoomId] = useState(shortId.generate());
    
    const handleLogin = () => {
        console.log('handleLogin')
        // props.history.push(`/${roomId}`)
        window.location.href = `/${roomId}`
    }
    return (
        <section>
            <div>
                <div>
                    <div className="box ltr">
                        <div className="logo">
                            Video/Text Chat
                            {/* <img src="https://grupo.baevox.com/gem/ore/grupo/global/logo.png" /> */}
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
                                        <input type="text" autoComplete="grautocmp" name="fname" placeholder="Full Name" />
                                    </label>
                                    <label><i className="gi-mail"></i>
                                        <input type="email" autoComplete="grautocmp" name="email" placeholder="Email Address" />
                                    </label>
                                    <label><i className="gi-globe"></i>
                                        <input type="text" autoComplete="grautocmp" name="name" placeholder="Username" />
                                    </label>
                                </div>

                                <div className="loginasguest d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="grnickname" className="nickname" name="nickname" placeholder="Nickname" />
                                    </label>
                                </div>
                                <div className="login">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="grautocmp" name="sign" placeholder="Email/Username" />
                                    </label>
                                </div>
                                <div className="global">
                                    <label><i className="gi-lock"></i>
                                        <input type="password" className="gstdep" autoComplete="grautocmp" name="pass" placeholder="Password" />
                                    </label>
                                </div>
                            </div>
                            <div className="regsep d-none"></div>
                            <div className="sub">
                                <span className="rmbr"><i><b></b><input type="hidden" name="rmbr" /></i> Remember Me</span>
                                <span className="doer" data-do="forgot">Forgot Password</span>
                            </div>
                            <div className="submitbtns">
                                <span className="submit global" form=".gr_sign" do="login" btn="Register" em="Invalid Input or Field Empty" gst="1" dlg="Login" onClick={handleLogin} >Login</span>
                                <span className="submit ajx reset d-none" form=".gr_sign">Reset</span>
                            </div>
                            <div className="switch" qn="Already have an account?" btn="Login">
                                <i>Donot have an account?</i>
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