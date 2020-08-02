import React, { useState } from 'react';
// import { IntegerInput } from './utils/slider'
// import shortId from 'shortid'
import { serverAPI } from '../config'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Login(props){
    const fname = React.useRef()
    const [email, setEmail] = useState('')
    const name = React.useRef()
    const [age, setAge] = useState(20);
    const genderM = React.useRef()
    const genderF = React.useRef()
    const sign = React.useRef()
    const pass = React.useRef()
    const nickname = React.useRef()
    const rmbr = React.useRef()
    
    const handleLogin = (e) => {
        const signType = e.target.innerHTML.toLowerCase()
        const guestType = document.getElementsByClassName('active')[0]
        const photo = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png'
        const gender = genderM.current.checked ? 1 : genderF.current.checked ? 2 : 3

        if (guestType.innerHTML.toLowerCase().includes('guest') && nickname.current.value && age && signType === "login") {
            getAndSetWithServer('saveNicknameAndcheckRoom', { nickname: nickname.current.value, gender: gender, age: age, photo: photo })
        } else {
            if (signType === "login") {
                if (sign.current.value && pass.current.value)
                    getAndSetWithServer( 'getSignUserData', { emailOruser: sign.current.value, password: pass.current.value } );
            } 
            if (signType === "register") {
                if (email && fname.current.value && name.current.value && age
                    && gender && pass.current.value)
                    getAndSetWithServer( 'saveSignUserData',
                        { 
                            email: email, 
                            fullname: fname.current.value, 
                            nickname: name.current.value, 
                            age: age, 
                            gender: gender, 
                            password: pass.current.value,
                            photo: photo
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
        console.log('--------------', data)

        // User Login Success
        if (data.status === 1) { 
            localStorage.setItem('userid', data.record.id)
            localStorage.setItem('age', data.record.age)
            localStorage.setItem('email', data.record.email)
            localStorage.setItem('fullname', data.record.fullname)
            localStorage.setItem('gender', data.record.gender)
            localStorage.setItem('nickname', data.record.nickname)
            localStorage.setItem('password', data.record.password)
            localStorage.setItem('roomid', data.record.roomid)
            localStorage.setItem('usercnt', data.record.usercnt)
            localStorage.setItem('country', data.record.country)
            localStorage.setItem('photo', data.record.photo)
            localStorage.setItem('nickuser', data.record.nickuser)

            tipEle.classList.add("green"); 

            setTimeout(function(){ 
                window.location.href = `/${data.record.roomid}`
            }, 500);
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

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handleAgeChange = (event) => {
        setAge(event.target.value)
    }

    function validateEmail(event) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(event.target.value) == false) 
        {
            toast.error('Failed in Email validation.')
            setEmail('')
        }
    }
    function ValidateNumber(event) {
        const min = parseInt(event.target.min)
        const max = parseInt(event.target.max)
        var value = parseInt(event.target.value)
        value = Math.max(min, Math.min(value, max))
        setAge(value)
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
                                <input type="hidden" autoComplete="off" name="act" value="1" />
                                <input type="hidden" autoComplete="off" name="do" className="doz" value="login" />

                                {/* Register User */}
                                <div className="register d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="off" name="fname" placeholder="Full Name" ref={fname} />
                                    </label>
                                    <label><i className="gi-mail"></i>
                                        <input 
                                            type="email"  
                                            name="email" 
                                            placeholder="Email Address" 
                                            value={email} 
                                            onChange={(e)=>handleEmailChange(e)}
                                            onBlur={validateEmail} 
                                        />
                                    </label>
                                    <label><i className="gi-globe"></i>
                                        <input type="text" autoComplete="off" name="name" placeholder="Nick Name" ref={name} />
                                    </label>
                                </div>

                                {/* Login As Guest */}
                                <div className="loginasguest">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="off" name="nickname" placeholder="Nickname" ref={nickname} />
                                    </label>
                                </div>

                                <div className="loginasguest register gender">
                                    <div>
                                        <input type="radio" name="gender" value="1" defaultChecked ref={genderM}/> 
                                        <span>Male</span>
                                    </div>
                                    <div>
                                        <input type="radio" name="gender" value="2" ref={genderF} />
                                        <span>Female</span>
                                    </div>
                                </div>

                                <label className="loginasguest register age"><i className="gi-eye-1"></i>
                                    <input
                                        autoComplete="off"
                                        value={age}
                                        type="number"
                                        name="age" 
                                        min={13}
                                        max={99}
                                        placeholder="Age"
                                        onChange={(e)=>handleAgeChange(e)}
                                        onBlur={(e)=>ValidateNumber(e)}
                                    />
                                </label>
                                
                                {/* Login  */}
                                <div className="login d-none">
                                    <label><i className="gi-user"></i>
                                        <input type="text" autoComplete="off" name="sign" placeholder="Email/Username" ref={sign} />
                                    </label>
                                </div>
                                <div className="global d-none">
                                    <label><i className="gi-lock"></i>
                                        <input type="password" autoComplete="nope" name="pass" placeholder="Password" ref={pass} />
                                    </label>
                                </div>
                            </div>
                            <div className="regsep d-none"></div>

                            {/* Submit */}
                            <div className="sub d-none">
                                <span className="rmbr"><i><b></b><input type="hidden" autoComplete="off" name="rmbr" ref={rmbr} /></i> Remember Me</span>
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
                    <ToastContainer 
                        autoClose={5000}
                        hideProgressBar={true}
                        position={toast.POSITION.BOTTOM_RIGHT}
                    />
                </div>
            </div>
        </section>
    )

}
export default Login;