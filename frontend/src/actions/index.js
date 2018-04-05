// define redux actions

import { 
    STORE_USER, CLEAR_USER,
    STORE_BOARD, CLEAR_BOARD,
    CREATE_COLUMN, RENAME_COLUMN, DELETE_COLUMN,
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

// TODO: used to rename a column 
export const renameColumn = (column_id, column_name, column_position) => ({
    type: RENAME_COLUMN,
    payload: {
        column_id: column_id,
        column_name: column_name,
        column_position: column_position
    }
});

// used to add a new column to the list
export const createColumn = (column) => ({
    type: CREATE_COLUMN,
    payload: {column}
});

// used to delete a column from the list
export const deleteColumn = (column_id, card_ids) => ({
    type: DELETE_COLUMN,
    payload: {
        column_id: column_id,
        card_ids: card_ids
    }
});

// TODO
export const updateCard = () => ({
    type: UPDATE_CARD,
    payload: {}
});

// TODO
export const createCard = (card) => ({
    type: CREATE_CARD,
    payload: {
        card: card
    }
});

// TODO
export const deleteCard = () => ({
    type: DELETE_CARD,
    payload: {}
});