import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { GET_USER, CLEAR_USER } from '../constants/actionTypes';

const initialState = {
    user: {}
};

const rootReducer = (state = initialState, action) => {
    
    switch (action.type) {
        case GET_USER:
            // get user data from database and add to store (on login)
            return state;
        case CLEAR_USER:
            // clear user data from store (on logout)
            return state;
        default:
            // bad action, so return the original state
            return state;
    }
    
}

export default rootReducer;

