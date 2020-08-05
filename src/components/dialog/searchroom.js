import React, {Component} from 'react'
// import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import { serverAPI } from '../../config'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// import images from '../Themes/Images'
import SelectSearch from 'react-select-search';

import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css'

import './search.css'
import './index.css'

class SearchRoom extends Component {
    constructor(props) {
        super(props)
        this.state = {
            gender: 0,
            min: 13, 
            max: 99,
            age: { min: 13, max: 99 },
            friends : []
        };
    }

    componentDidMount() {
        const value = {
            gender: this.state.gender,
            min: this.state.min,
            max: this.state.max
        }
        this.getAndSetServerData('getAvailableRooms', value)
    }
    onChangeGender = event => {
        this.setState({gender: event.target.value})
    }
    onChangeInputRange = value => {
        this.setState({min: value.min})
        this.setState({max: value.max})
        this.setState({age: value})
    }
    searchRoom = event => {
        const value = {
            gender: this.state.gender,
            min: this.state.min,
            max: this.state.max
        }
        this.getAndSetServerData('getAvailableRooms', value)
    }

    getAndSetServerData(url, value) {
        return new Promise((resolve, reject) => {
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
                    resolve(data.newroom)
                } else if (data.status === 2) {
                    toast.error(data.message)
                } else if (data.status === 3) {
                    console.log(data)
                    data.record.forEach(element => {
                        element.name = element.fullname
                        element.value = element.nickname
                    });
                    this.setState({friends: data.record})
                    // resolve(data.record)
                }
            })
            .catch(err => console.log(err))
        })
    }

    renderFriend(props, option, snapshot, className) {
        const imgStyle = {
            borderRadius: '50%',
            verticalAlign: 'middle',
            marginRight: 10,
        };
    
        return (
            <button {...props} className={className} type="button">
                <span>
                    <img alt="" style={imgStyle} width="32" height="32" src={option.photo} />
                    <span className='search-span'>{option.name}</span>
                    <span className='search-span'>{option.age}</span>
                    <span className='search-span'>{option.country}</span>
                </span>
            </button>
        );
    }

    render() {
        return (
            <div className='viewRoot'>
                <div className='genderRadio'>
                    <input type='radio' id="gender" name="gender" value='0' onChange={this.onChangeGender}
                        defaultChecked={this.state.gender === 0 ? true : false} />
                    <label htmlFor='male'>All</label>
                    <input type='radio' id="gender" name="gender" value='1' onChange={this.onChangeGender} 
                        defaultChecked={this.state.gender === 1 ? true : false} />
                    <label htmlFor='male'>Male</label>
                    <input type='radio' id="gender" name="gender" value='2' onChange={this.onChangeGender} 
                        defaultChecked={this.state.gender === 2 ? true : false} />
                    <label htmlFor='female'>Female</label>
                </div>
                <InputRange
                    minValue={13}
                    maxValue={99}
                    value={this.state.age}
                    onChange={this.onChangeInputRange} />
                <SelectSearch
                    className="select-search select-search--multiple"
                    options={this.state.friends}
                    renderOption={this.renderFriend}
                    multiple
                    search
                    placeholder="Search friends"
                />
                <button className="btnUpdate" onClick={this.searchRoom}>
                    Search
                </button>
            </div>
        )
    }
}
export default withRouter(SearchRoom)
// export default Setting;