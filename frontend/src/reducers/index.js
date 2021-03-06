// redux reducers for adding new state

import { 
    STORE_USER, CLEAR_USER,
    STORE_BOARD, UPDATE_BOARD, CLEAR_BOARD,
    CREATE_COLUMN, RENAME_COLUMN, DELETE_COLUMN,
    MOVE_CARD, CREATE_CARD, DELETE_CARD, UPDATE_CARD
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
    var cards = null;
    var i = 0;

    switch (action.type) {
        case STORE_USER:
            // add user data to store (on login)
            return {...state, user: action.payload, auth: true};

        case CLEAR_USER:
            // clear user data from store (on logout)
            return {...state, user: action.payload, auth: false};

        case STORE_BOARD:
            // add board data to store (when entering board page)
            return {
                ...state,
                boardData: action.payload.boardData,
                columns: action.payload.columns,
                cards: action.payload.cards
            };

        case UPDATE_BOARD:
            var board = Object.assign({}, state.boardData);
            
            switch (action.payload.update_type) {
                
                case 'rename':
                    board.board_name = action.payload.data.board_name;
                    break;

                case 'description':
                    board.board_description = action.payload.data.board_description;
                    break;

                default:
                    break;
            }

            return {
                ...state,
                boardData: board
            }
            

        case CLEAR_BOARD:
            // clear board data from store (when leaving board page)
            return {
                ...state, 
                boardData: {},
                columns: [],
                cards: []
            };

        case RENAME_COLUMN:
            // manipulate name of the column
            
            // columns variable declared above switch statement to avoid warning
            columns = [];
            columns = columns.concat(state.columns);

            // loop over columns to find the one we want to update
            for (i = 0; i < columns.length; i++) {
                if (columns[i].column_id === action.payload.column_id) {
                    columns[i].column_name = action.payload.column_name;
                }
            }

            return {
                ...state,
                columns: columns
            };

        case CREATE_COLUMN:
            // create a new column completely and add it to the list

            // columns variable declared above switch statement to avoid warning
            columns = [];
            columns = columns.concat(state.columns);
            columns.push(action.payload.column);

            return {
                ...state,
                columns: columns
            };

        case DELETE_COLUMN: 
            // remove a column from the list

            // columns variable declared above switch statement to avoid warning
            columns = [];
            columns = columns.concat(state.columns);
            cards = state.cards;
            var card_ids = action.payload.card_ids;
            var column_position = -1;

            // remove column from the array of columns
            // loop in reverse because splice causes indexing problems
            for (i = columns.length - 1; i >= 0; i--) {
                if (columns[i].column_id === action.payload.column_id) {
                    // get position of deleted column in order to update positions of other columns
                    column_position = columns[i].column_position;

                    // cut deleted column out of the array
                    columns.splice(i, 1);
                }
            }

            // loop over remaining columns in length and change the position if necessary
            for (i = 0; i < columns.length; i++) {
                if (columns[i].column_position > column_position) {
                    columns[i].column_position--;
                }
            }

            // delete all cards that were in the deleted column
            var cards_to_delete = [];
            for (i = 0; i < card_ids.length; i++) {
                var card_index = cards.indexOf(card_ids[i]);
                cards_to_delete.push(card_index);
            }
            for (i = 0; i < cards_to_delete.length; i++) {
                cards.splice(cards_to_delete[i], 1);
            }

            // for (i = 0; i < card_ids.length; i++) {
            //     for (var j = cards.length - 1; j > 0; j--) {
            //         if (card_ids[i].card_id === cards[j].card_id) {
            //             cards.splice(i, 1);
            //             break;
            //         }
            //     }
            // }
            
            return {
                ...state,
                columns: columns,
                cards: cards
            };

        case MOVE_CARD: 
            // move a card to another column, update card positions 
            cards = [];
            cards = cards.concat(state.cards);
            var card_id = action.payload.card_id;
            var old_column_id = action.payload.old_column_id;
            var new_column_id = action.payload.new_column_id;
            var old_card_position = action.payload.old_card_position;
            var new_card_position = action.payload.new_card_position;

            // due to removing an element at top of list,
            // if moving in same column and new position > old position,
            // decrement the supposed new card position once to account for
            // removing an element from higher up on the list 
            if (old_column_id === new_column_id && new_card_position > old_card_position) {
                new_card_position--;
            }

            // set new card position and column id for moved card
            for (i = 0; i < cards.length; i++) {
                if (cards[i].card_id === card_id) {
                    cards[i].column_id = new_column_id;
                    cards[i].card_position = new_card_position;
                }
            }

            if (old_column_id !== new_column_id) {
                // moving card to new column
                
                // decrement card positions in old column only if card moved to a new column
                for (i = 0; i < cards.length; i++) {
                    if (cards[i].column_id === old_column_id && cards[i].card_position > old_card_position) {
                        cards[i].card_position--;
                    }
                }

                // update (increment) card positions in new column
                for (i = 0; i < cards.length; i++) {
                    if (cards[i].card_id !== card_id &&
                        cards[i].column_id === new_column_id && 
                        cards[i].card_position >= new_card_position) {

                        cards[i].card_position++;
                    }
                }
            }
            else {
                // moving card within same column

                if (new_card_position > old_card_position) {
                    // if new position > old position, decrement betweeners
                    for (i = 0; i < cards.length; i++) {
                        if (cards[i].column_id === old_column_id && 
                            cards[i].card_id !== card_id &&
                            cards[i].card_position > old_card_position &&
                            cards[i].card_position <= new_card_position
                        ) {
                            cards[i].card_position--;
                        }
                    }
                }
                else {
                    // if new position < old position, increment betweeners
                    for (i = 0; i < cards.length; i++) {
                        if (cards[i].column_id === old_column_id && 
                            cards[i].card_id !== card_id &&
                            cards[i].card_position < old_card_position &&
                            cards[i].card_position >= new_card_position
                        ) {
                            cards[i].card_position++;
                        }
                    }
                }
                
            }

            return {
                ...state,
                cards: cards
            };

        case CREATE_CARD:
            // create a completely new card, add it to the list
            cards = [];
            cards = cards.concat(state.cards);

            cards.push(action.payload.card);

            return {
                ...state,
                cards: cards
            };
        
        case DELETE_CARD: 
            // remove a card from the list
            cards = [];
            cards = cards.concat(state.cards);

            var card_position = -1;
            var column_id = -1;

            // search for card we want to delete
            for (i = 0; i < cards.length; i++) {
                if (cards[i].card_id === action.payload.card_id) {
                    // get card's position and column
                    card_position = cards[i].card_position;
                    column_id = cards[i].column_id;

                    // delete the card from the array
                    cards.splice(i, 1);
                    break;
                }
            }

            // decrement positions of cards that came after it in same column
            for (i = 0; i < cards.length; i++) {
                if (cards[i].column_id === column_id && cards[i].card_position > card_position) {
                    cards[i].card_position--;
                }
            }

            return {
                ...state,
                cards: cards
            };

        case UPDATE_CARD: // TODO
            // update any card info for a specific card
            cards = [];
            cards = cards.concat(state.cards);

            for (i = 0; i < cards.length; i++) {
                if (cards[i].card_id === action.payload.card_id) {
                    switch(action.payload.update_type) {
                        case 'rename':
                            cards[i].card_name = action.payload.data.card_name;
                            break;

                        case 'description': 
                            cards[i].card_description = action.payload.data.card_description;
                            break;

                        case 'addcomment':
                            cards[i].card_comments = action.payload.data.card_comments
                            break;

                        case 'duedate':
                            cards[i].card_due = action.payload.data.due_date;
                            break;

                        case 'priority':
                            cards[i].card_priority = action.payload.data.card_priority;
                            break;

                        case 'tags':
                            // have to do this trick to make sure the arrays are separate
                            var card_tags = [];
                            card_tags = card_tags.concat(action.payload.data.card_tags);
                            cards[i].card_tags = card_tags;
                            break;

                        default:
                            break;
                    }
                }
            }

            return {
                ...state, 
                cards: cards
            }

        default:
            // unrecognized action, so return the original state
            return state;
    }
    
}

export default rootReducer;

