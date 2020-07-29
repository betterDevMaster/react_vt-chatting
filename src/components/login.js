import React, { useState } from 'react';
// import { SliderComponent } from 'react-input-range-slider'
// import 'react-input-range-slider/dist/index.css'
import { IntegerInput } from './utils/slider'
import shortId from 'shortid'
import { serverAPI } from '../config'

function Login(props){
    const [roomId, setRoomId] = useState(shortId.generate());
    
    const fname = React.useRef();
    const email = React.useRef();
    const name = React.useRef();
    const [age, setAge] = useState(20);
    const gender = React.useRef();
    const sign = React.useRef();
    const pass = React.useRef();
    const nickname = React.useRef();
    const rmbr = React.useRef();
    
    const handleLogin = (e) => {
        const signType = e.target.innerHTML.toLowerCase()
        const guestType = document.getElementsByClassName('active')[0]

        if (guestType.innerHTML.toLowerCase().includes('guest') && nickname.current.value.length !== 0 && signType === "login") {
            getAndSetWithServer('saveNicknameAndcheckRoom', { nickname: nickname.current.value, gender: 2, age: 0 })
        } else {
            if (signType === "login") {
                if (sign.current.value && pass.current.value)
                    getAndSetWithServer( 'getSignUserData', { emailOruser: sign.current.value, password: pass.current.value } );
            } 
            if (signType === "register") {
                if (email.current.value && fname.current.value && name.current.value && age
                    && gender.current.value && pass.current.value)
                    getAndSetWithServer( 'saveSignUserData',
                        { 
                            email: email.current.value, 
                            fullname: fname.current.value, 
                            nickname: name.current.value, 
                            age: age, 
                            gender: parseInt(gender.current.value), 
                            password: pass.current.value 
                        }
                    );
            } 
        }
    }
    const handleReset = (e) => {
        if (sign.current.value)
            getAndSetWithServer( 'getForgotPassword', { emailOruser: sign.current.value } )
    }
    function getAndSetWithServer(url, value) {
        fetch(`${serverAPI}/${url}`, {
            method: 'post',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify(value)
        })
        .then(res => res.json())
        .then(data => {
            showResult(url, data)
        })
        .catch(err => console.log(err))
    }
    function showResult(url, data) {
        const tipEle = document.getElementsByClassName('ajxout')[0]
        tipEle.style.display = 'inline'
        tipEle.innerHTML = data.message

        // User Login Success
        if (data.status === 1) { 
            tipEle.classList.add("green"); 
            console.log('data : -----------', data)

            setTimeout(function(){ 
                window.location.href = `/${data.roomid}`
            }, 1000);
        // User Account failed
        } else  if (data.status === 2) {
            tipEle.classList.add("red"); 

            setTimeout(function(){ 
                tipEle.style.display = 'none'
                tipEle.classList.remove("red");
            }, 3000);
        // User Create Success
        } else if (data.status === 3) {
            tipEle.classList.add("green"); 

            setTimeout(function(){ 
                tipEle.style.display = 'none'
                tipEle.classList.remove("green");
            }, 2000);
        // User Retrive Password
        } else if (data.status === 4) {
            tipEle.classList.add("orange"); 

            setTimeout(function(){ 
                tipEle.style.display = 'none'
                tipEle.classList.remove("orange");
            }, 3000);
        }
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
                                <li className="active">Login as Guest</li>
                                <li className="lag">Login</li>
                            </ul>
                        </div>
                        <form autoComplete="off" className="gr_sign">
                            <div className="elements">
                                <input type="hidden" name="act" value="1" />
                                <input type="hidden" name="do" className="doz" value="login" />

                                {/* Register User */}
                                <div className="register d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text"  name="fname" placeholder="Full Name" ref={fname} />
                                    </label>
                                    <label><i className="gi-mail"></i>
                                        <input type="email"  name="email" placeholder="Email Address" ref={email}/>
                                    </label>
                                    <label><i className="gi-globe"></i>
                                        <input type="text"  name="name" placeholder="Nick Name" ref={name} />
                                    </label>

                                    {/* <span style={{position: 'absolute', top: '262px', left: '109px', color: 'rgb(0, 173, 181)' }}>Age: </span>
                                    <SliderComponent
                                        min={15}
                                        max={80}
                                        step={1}
                                        value={20}
                                        callback={(value) => getCurrentValue(value)}
                                    >
                                    </SliderComponent> */}

                                    <label><i className="gi-eye-1"></i>
                                        <IntegerInput value={ age } min={13} max={99} onChange={ (age) => setAge(age) }/>

                                        {/* <input type="number" name="name" min="13" max="99" value={age} onChange={(e) => getCurrentValue(e)} /> */}
                                    </label>

                                    <div className="gender">
                                        <div>
                                            <input type="radio" id="male" name="gender" value="1" defaultChecked ref={gender}/> 
                                            <span>Male</span>
                                        </div>
                                        <div>
                                            <input type="radio" id="female" name="gender" value="2" ref={gender} />
                                            <span>Female</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Login As Guest */}
                                <div className="loginasguest">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="grnickname" className="nickname" name="nickname" placeholder="Nickname" ref={nickname} />
                                    </label>
                                </div>

                                {/* Login  */}
                                <div className="login d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text"  name="sign" placeholder="Email/Username" ref={sign} />
                                    </label>
                                </div>
                                <div className="global d-none">
                                    <label><i className="gi-lock"></i>
                                        <input type="password" className="gstdep"  name="pass" placeholder="Password" ref={pass} />
                                    </label>
                                </div>
                            </div>
                            <div className="regsep d-none"></div>

                            {/* Submit */}
                            <div className="sub d-none">
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