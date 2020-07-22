import { API_URL } from './config'

const setSignUserData = (value) => {
    fetch(`${API_URL}/setSignUserData`, {
        method: 'post',
        headers: {
        accept: 'application/json', 
        'content-type': 'application/json'
        },
        body: JSON.stringify({ values: value })
    })
    .then(res => res.json())
    .then(data => {
        return data;
    })
    .catch(err => console.log(err))
};

export default {
    setSignUserData,
    getSignUserData
};
  