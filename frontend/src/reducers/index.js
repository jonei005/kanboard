// redux reducers for adding new state

import { 
    STORE_USER, 
    CLEAR_USER,
    STORE_BOARD,
    UPDATE_BOARD,
    CLEAR_BOARD 
} from "../constants/actionTypes";

const initialState = {
    user: {},
    board: {},
    auth: false
}

const rootReducer = (state = initialState, action) => {

    switch (action.type) {
        case STORE_USER:
            // add user data to store (on login)
            return {...state, user: action.payload, auth: true};

        case CLEAR_USER:
            // clear user data from store (on logout)
            return {...state, user: action.payload, auth: false};

        case STORE_BOARD:
            // add board data to store (when entering board page)
            return state; // TODO

        case UPDATE_BOARD:
            // update board data in store (when manipulating columns/cards)
            return state; // TODO

        case CLEAR_BOARD:
            // clear board date from store (when leaving board page)
            return {...state, board: action.payload};

        default:
            // unrecognized action, so return the original state
            return state;
    }
    
}

export default rootReducer;

