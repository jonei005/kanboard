import { GET_USER, CLEAR_USER } from "../constants/actionTypes";

// define actions

export const getUser = (user_id) => ({
    type: GET_USER,
    payload: user_id
});

export const clearUser = () => ({
    type: CLEAR_USER,
    payload: true
});