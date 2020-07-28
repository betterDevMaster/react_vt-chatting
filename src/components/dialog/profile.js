import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import {myFirestore, myStorage} from '../../Config/MyFirebase'
import images from '../Themes/Images'
import './index.css'
import {AppString} from '../Const'
// import SocialButton from '../common/SocialButton'
// import { JwModal } from '.';

// function Setting(props) {
//     const dispatch = useDispatch()
class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            // id: localStorage.getItem(AppString.ID),
            // name: localStorage.getItem(AppString.name),
            // aboutMe: localStorage.getItem(AppString.ABOUT_ME),
            // photoUrl: localStorage.getItem(AppString.PHOTO_URL)
            aboutMe: "This is static test about me",
            id: "0dp4NACJMYT5DsMftyw9n5SV7QA2",
            email: "test@test.com",
            name: "rapidspikes",
            gender: 1,
            age: 21,
            country: "colombia",
            photoUrl: "https://lh4.googleusercontent.com/-5w7J-G1h9jQ/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclrfYXPy933UA9jCPcV0LUiCZcDmA/s96-c/photo.jpg",
        }

        this.newAvatar = null
        this.newPhotoUrl = ''
    }

    // componentDidMount() {
    //     this.checkLogin()
    // }

    // checkLogin = () => {
    //     if (!localStorage.getItem(AppString.ID)) {
    //         this.props.history.push('/')
    //     }
    // }

    onChangeName = event => {
        this.setState({name: event.target.value})
    }

    onChangeEmail = event => {
        this.setState({email: event.target.value})
    }

    onChangeAge = event => {
        this.setState({age: event.target.value})
    }

    onChangeGender = event => {
        this.setState({gender: event.target.value})
    }

    onChangeCountry = event => {
        this.setState({country: event.target.value})
    }

    onChangeAboutMe = event => {
        this.setState({aboutMe: event.target.value})
    }

    onChangeAvatar = event => {
        if (event.target.files && event.target.files[0]) {
            // Check this file is an image?
            const prefixFiletype = event.target.files[0].type.toString()
            if (prefixFiletype.indexOf(AppString.PREFIX_IMAGE) !== 0) {
                this.props.showToast(0, 'This file is not an image')
                return
            }
            this.newAvatar = event.target.files[0]
            this.setState({photoUrl: URL.createObjectURL(event.target.files[0])})
        } else {
            this.props.showToast(0, 'Something wrong with input file')
        }
    }

    uploadAvatar = () => {
        this.setState({isLoading: true})
        if (this.newAvatar) {
            const uploadTask = myStorage
                .ref()
                .child(this.state.id)
                .put(this.newAvatar)
            uploadTask.on(
                AppString.UPLOAD_CHANGED,
                null,
                err => {
                    this.props.showToast(0, err.message)
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        this.updateUserInfo(true, downloadURL)
                    })
                }
            )
        } else {
            this.updateUserInfo(false, null)
        }
    }

    updateUserInfo = (isUpdatePhotoUrl, downloadURL) => {
        let newInfo
        if (isUpdatePhotoUrl) {
            newInfo = {
                name: this.state.name,
                aboutMe: this.state.aboutMe,
                photoUrl: downloadURL
            }
        } else {
            newInfo = {
                name: this.state.name,
                aboutMe: this.state.aboutMe
            }
        }
        myFirestore
            .collection(AppString.NODE_USERS)
            .doc(this.state.id)
            .update(newInfo)
            .then(data => {
                localStorage.setItem(AppString.name, this.state.name)
                localStorage.setItem(AppString.ABOUT_ME, this.state.aboutMe)
                if (isUpdatePhotoUrl) {
                    localStorage.setItem(AppString.PHOTO_URL, downloadURL)
                }
                this.setState({isLoading: false})
                this.props.showToast(1, 'Update info success')
            })
    }

    render() {
        return (
            <div className="viewRoot">
                {/* <div className="header">
                    <span>PROFILE</span>
                </div> */}
                <div className="avatarPanel">
                    <h2>User Profile</h2>
                    <img className="avatar" alt="Avatar" src={this.state.photoUrl}/>

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
                    value={this.state.name ? this.state.name : ''}
                    placeholder="Your name..."
                    onChange={this.onChangeName}
                />
                <input
                    className="textInput"
                    value={this.state.email ? this.state.email : ''}
                    placeholder="Your email..."
                    onChange={this.onChangeEmail}
                />
                <input
                    className="textInput"
                    value={this.state.age ? this.state.age : ''}
                    type="number"
                    min={20}
                    placeholder="Your age..."
                    onChange={this.onChangeAge}
                />
                <div className="genderRadio">
                    {/* <div> */}
                        <input type="radio" id="gender" name="gender" value="1" />
                        <label htmlFor="male">Male</label>
                    {/* </div>
                    <div> */}
                        <input type="radio" id="gender" name="gender" value="2" />
                        <label htmlFor="female">Female</label>
                    {/* </div> */}
                </div>
                <input
                    className="textInput"
                    value={this.state.country ? this.state.country : ''}
                    placeholder="Your country..."
                    onChange={this.onChangeCountry}
                />
                <input
                    className="textInput"
                    value={this.state.aboutMe ? this.state.aboutMe : ''}
                    placeholder="Tell about yourself..."
                    onChange={this.onChangeAboutMe}
                />

                <button className="btnUpdate" onClick={this.uploadAvatar}>
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