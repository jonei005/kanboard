// define redux actions

import { 
    STORE_USER, CLEAR_USER,
    STORE_BOARD, CLEAR_BOARD,
    UPDATE_COLUMN, CREATE_COLUMN, DELETE_COLUMN,
    UPDATE_CARD, CREATE_CARD, DELETE_CARD
} from "../constants/actionTypes";

export const storeUser = (user) => ({
    type: STORE_USER,
    payload: user,
});

export const clearUser = () => ({
    type: CLEAR_USER,
    payload: {},
});

// used to store board, column, and card data 
export const storeBoard = (boardData, columns, cards) => ({
    type: STORE_BOARD,
    payload: {
        boardData: boardData,
        columns: columns,
        cards: cards
    }
});

// used to remove board, column, and card data
export const clearBoard = () => ({
    type: CLEAR_BOARD,
    payload: {}
});

export const updateColumn = () => ({
    type: UPDATE_COLUMN,
    payload: {}
});

export const createColumn = () => ({
    type: CREATE_COLUMN,
    payload: {}
});

export const deleteColumn = () => ({
    type: DELETE_COLUMN,
    payload: {}
});

export const updateCard = () => ({
    type: UPDATE_CARD,
    payload: {}
});

export const createCard = () => ({
    type: CREATE_CARD,
    payload: {}
});

export const deleteCard = () => ({
    type: DELETE_CARD,
    payload: {}
});