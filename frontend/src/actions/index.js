import { 
    STORE_USER, 
    CLEAR_USER,
    STORE_BOARD,
    UPDATE_BOARD,
    CLEAR_BOARD 
} from "../constants/actionTypes";

// define actions

export const storeUser = (user) => ({
    type: STORE_USER,
    payload: user,
});

export const clearUser = () => ({
    type: CLEAR_USER,
    payload: {},
});

export const storeBoard = (board) => ({
    type: STORE_BOARD,
    payload: board
});

export const updateBoard = (update) => ({
    type: UPDATE_BOARD,
    payload: update
});

export const clearBoard = () => ({
    type: CLEAR_BOARD,
    payload: {}
});