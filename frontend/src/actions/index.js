import { 
    STORE_USER,
    CLEAR_USER 
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