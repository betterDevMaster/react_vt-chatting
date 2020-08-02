import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import { serverAPI } from '../../config'
import { ToastContainer, toast } from 'react-toastify'
import images from '../Themes/Images'

import 'react-toastify/dist/ReactToastify.css'
import './index.css'

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            email: localStorage.getItem('email'),
            fullname: localStorage.getItem('fullname'),
            nickname: localStorage.getItem('nickname'),
            gender: parseInt(localStorage.getItem('gender')),
            age: parseInt(localStorage.getItem('age')),
            country: localStorage.getItem('country'),
            photo: localStorage.getItem('photo'),
        }
    }

    onChangeAvatar = event => {
        if (event.target.files && event.target.files[0]) {
            this.setState({isLoading: true})
            let reader = new FileReader();
    
            reader.onloadend = () => {
                this.setState({photo: reader.result})
                this.setState({isLoading: false})
            }
            reader.readAsDataURL(event.target.files[0])
        }
    }

    onChangeEmail = event => {
        this.setState({email: event.target.value})
    }

    onChangeFullname = event => {
        this.setState({fullname: event.target.value})
    }

    onChangeNickName = event => {
        this.setState({nickname: event.target.value})
    }

    onChangeGender = event => {
        this.setState({gender: event.target.value})
    }

    onChangeAge = event => {
        this.setState({age: event.target.value})
    }

    onChangeCountry = event => {
        this.setState({country: event.target.value})
    }

    updateUserInfo = () => {
        const value = {
            id: localStorage.getItem('userid'),
            email: this.state.email,
            fullname: this.state.fullname,
            nickname: this.state.nickname,
            gender: this.state.gender,
            age: this.state.age,
            country: this.state.country,
            photo: this.state.photo,
        }
        var url = 'updateSignUserData'

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
            if (data.status === 1) {
                localStorage.setItem('email', this.state.email)
                localStorage.setItem('fullname', this.state.fullname)
                localStorage.setItem('nickname', this.state.nickname)
                localStorage.setItem('gender', this.state.gender)
                localStorage.setItem('age', this.state.age)
                localStorage.setItem('photo', this.state.photo)
                localStorage.setItem('updateuser', 1)

                window.location.href = `/${localStorage.getItem('roomid')}`
            }
        })
        .catch(err => console.log(err))
    }

    validateEmail = event => {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(event.target.value) == false) 
        {
            toast.error('Failed in Email validation.')
            this.setState({email: ''})
        }
    }
    ValidateNumber = event => {
        const min = parseInt(event.target.min)
        const max = parseInt(event.target.max)
        var value = parseInt(event.target.value)
        
        value = Math.max(min, Math.min(value, max))
        this.setState({age: value})
    }

    render() {
        return (
            <div className="viewRoot">
                <div className="avatarPanel">
                    <h2>User Profile</h2>
                    <img className="avatar" alt="Avatar" src={this.state.photo}/>

                    <div className="viewWrapInputFile">
                        <img
                            className="imgInputFile"
                            alt="icon gallery"
                            src={images.ic_input_file}
                            onClick={() => this.refInput.click()}
                        />
                        <input
                            ref={el => {
                                this.refInput = el
                            }}
                            accept="image/*"
                            className="viewInputFile"
                            type="file"
                            onChange={this.onChangeAvatar}
                        />
                    </div>
                </div>
                <input
                    className="textInput"
                    value={this.state.email ? this.state.email : ''}
                    placeholder="Your email..."
                    onChange={this.onChangeEmail}
                    onBlur={this.validateEmail} 
                />
                <input
                    className="textInput"
                    value={this.state.fullname ? this.state.fullname : ''}
                    placeholder="Your name..."
                    onChange={this.onChangeFullname}
                />
                <input
                    className="textInput"
                    value={this.state.nickname ? this.state.nickname : ''}
                    placeholder="Your nickname..."
                    onChange={this.onChangeNickName}
                />
                <input
                    className="textInput"
                    value={this.state.age ? this.state.age : ''}
                    type="number"
                    min={13}
                    max={99}
                    placeholder="Your age..."
                    onChange={this.onChangeAge}
                    onBlur={this.ValidateNumber}
                />
                <div className="genderRadio">
                    <input type="radio" id="gender" name="gender" value="1" onChange={this.onChangeGender}
                        defaultChecked={this.state.gender === 1 ? true : false} />
                    <label htmlFor="male">Male</label>

                    <input type="radio" id="gender" name="gender" value="2"  onChange={this.onChangeGender}
                        defaultChecked={this.state.gender === 2 ? true : false} />
                    <label htmlFor="female">Female</label>
                </div>
                <input
                    className="textInput"
                    value={this.state.country ? this.state.country : ''}
                    placeholder="Your country..."
                    disabled
                    onChange={this.onChangeCountry}
                />

                <button className="btnUpdate" onClick={this.updateUserInfo}>
                    Update
                </button>

                {this.state.isLoading ? (
                    <div className="viewLoading">
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'}
                        />
                    </div>
                ) : null}
            </div>
        )
    }
}
export default withRouter(Profile)
// export default Setting;