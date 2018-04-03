// redux reducers for adding new state

import { 
    STORE_USER, CLEAR_USER,
    STORE_BOARD, CLEAR_BOARD,
    UPDATE_COLUMN, CREATE_COLUMN, DELETE_COLUMN,
    UPDATE_CARD, CREATE_CARD, DELETE_CARD
} from "../constants/actionTypes";

const initialState = {
    user: {},
    auth: false,
    boardData: {},
    columns: [],
    cards: []
}

const rootReducer = (state = initialState, action) => {

    var columns = null;

    switch (action.type) {
        case STORE_USER:
            // add user data to store (on login)
            return {...state, user: action.payload, auth: true};

        case CLEAR_USER:
            // clear user data from store (on logout)
            return {...state, user: action.payload, auth: false};

        case STORE_BOARD: // TODO
            // add board data to store (when entering board page)
            return {
                ...state,
                boardData: action.payload.boardData,
                columns: action.payload.columns,
                cards: action.payload.cards
            };

        case CLEAR_BOARD:
            // clear board data from store (when leaving board page)
            return {
                ...state, 
                boardData: {},
                columns: [],
                cards: []
            };

        case UPDATE_COLUMN: // TODO
            // manipulate some data of the column
            return state;

        case CREATE_COLUMN:
            // create a new column completely and add it to the list

            // FIX: NOT UPDATING UI

            columns = state.columns;
            columns.push(action.payload.column);

            return {
                ...state,
                columns: columns
            };

        case DELETE_COLUMN: // TODO
            // remove a column from the list

            // FIX: NOT UPDATING UI

            columns = state.columns;
            var cards = state.cards;
            var card_ids = action.payload.card_ids;

            // loop in reverse because splice causes indexing problems
            for (var i = columns.length - 1; i > 0; i--) {
                if (columns[i].column_id === action.payload.column_id) {
                    columns.splice(i, 1);
                }
            }

            for (i = 0; i < card_ids.length; i++) {
                for (var j = cards.length - 1; j > 0; j--) {
                    if (card_ids[i].card_id === cards[j].card_id) {
                        cards.splice(i, 1);
                        break;
                    }
                }
            }
            
            return {
                ...state,
                columns: columns,
                cards: cards
            };

        case UPDATE_CARD: // TODO
            // manipulate some data of the card
            return state;

        case CREATE_CARD: // TODO
            // create a completely new card, add it to the list
            return state;
        
        case DELETE_CARD: // TODO
            // remove a card from the list
            return state;

        default:
            // unrecognized action, so return the original state
            return state;
    }
    
}

export default rootReducer;

