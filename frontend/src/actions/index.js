// define redux actions

import { 
    STORE_USER, CLEAR_USER,
    STORE_BOARD, CLEAR_BOARD,
    CREATE_COLUMN, RENAME_COLUMN, DELETE_COLUMN,
    MOVE_CARD, CREATE_CARD, DELETE_CARD
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
export const moveCard = (card_id, old_col_id, new_col_id, old_card_pos, new_card_pos) => ({
    type: MOVE_CARD,
    payload: {
        card_id: card_id,
        old_column_id: old_col_id,
        new_column_id: new_col_id,
        old_card_position: old_card_pos,
        new_card_position: new_card_pos
    }
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