// redux reducers for adding new state

import { 
    STORE_USER, 
    CLEAR_USER 
} from "../constants/actionTypes";

// set initial state
// should get token from localstorage to authenticate here, so user persists over refresh
function checkUserToken() {
    var token = localStorage.getItem('kanboard-user-token') || null;
    if (token) {
        console.log("Token found!");
        // call api to send token and get user data back
        var user = {};
        
        return {
            user: user,
            auth: true
        };
    }
    else {
        console.log("No token found!");
        return {
            user: {},
            auth: false
        };
    }
}

const initialState = checkUserToken();

const rootReducer = (state = initialState, action) => {

    switch (action.type) {
        case STORE_USER:
            // add user data to store (on login)
            return {...state, user: action.payload, auth: true};

        case CLEAR_USER:
            // clear user data from store (on logout)
            return {...state, user: action.payload, auth: false};

        default:
            // bad action, so return the original state
            return state;
    }
    
}

export default rootReducer;

