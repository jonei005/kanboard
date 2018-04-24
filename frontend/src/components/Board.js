import React, { Component } from 'react';
import Column from './Column';
import BoardMenu from './BoardMenu';
import CardModal from './CardModal';
import { connect } from 'react-redux';
import { 
    storeBoard, updateBoard, clearBoard,
    createColumn, deleteColumn, renameColumn,
    createCard
} from './../actions'; // make actual action for updating board stuffs
import './../css/Board.css';

class Board extends Component {
    
    constructor(props) {
        super(props);


        // get board id from pathname (ex: '/board/6')
        // split string on '/' characters, then get 3rd entry (just the '6)
        var board_id = this.props.location.pathname.split('/')[2];

        this.state = {
            board_id: board_id,
            board_name: '',
            board_data: {},
            columnFormOpen: false,
            columnFormText: '',
            cardModalOpen: false,
            cardModalId: -1,
            renameFormOpen: false,
            renameFormInput: props.boardData.board_name,
            boardDeleted: false
        }
    }

    componentDidMount() {
        
        var token = localStorage.getItem('kanboard-user-token');

        // send user token, get board data from database based on path
        // add boards to state (id and name)

        fetch('http://localhost:3001/board/' + this.state.board_id, {
            method: 'post',
            body: JSON.stringify({token: token}),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status !== 200) {
                console.log('Something went wrong with getting board data');
            }
            return response.json();
        }).then((data) => {

            document.title = 'Kanboard - ' + data.boardData.board_name;

            // console.log(data.message);

            // store board, column, card data in redux store
            this.props.storeBoard(data.boardData, data.columnData, data.cardData);

            // write board_name to renameFormInput 
            this.setState({renameFormInput: data.boardData.board_name});
        });
    }

    componentWillUnmount() {
        // remove the board, column, and card data from redux store
        this.props.clearBoard();
    }

    toggleRenameForm() {
        this.setState({renameFormOpen: !this.state.renameFormOpen, renameFormInput: this.props.boardData.board_name});
    }

    renameBoard() {
        var new_board_name = this.state.renameFormInput;

        if (new_board_name === this.props.boardData.board_name || new_board_name === '') {
            this.setState({renameFormOpen: false, renameFormInput: this.props.boardData.board_name});
            return;
        }

        fetch('http://localhost:3001/renameboard/' + this.props.boardData.board_id, {
            method: 'post',
            body: JSON.stringify({
                token: localStorage.getItem('kanboard-user-token'),
                new_board_name: new_board_name,
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with board rename fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);
                
                // close the rename form
                this.setState({renameFormOpen: false, renameFormInput: new_board_name});

                // update board name in redux
                this.props.updateBoard({board_name: new_board_name}, 'rename');
            }
        });
    }

    toggleColumnForm() {
        this.setState({columnFormOpen: !this.state.columnFormOpen});
    }

    addColumn() {
        // alert('add column');

        if (this.state.columnFormText === '') {
            this.setState({columnFormOpen: false});
            return;
        }
        
        var token = localStorage.getItem('kanboard-user-token');
        var columns = this.props.columns;
        var column_position = columns.length;
        var column_name = this.state.columnFormText;

        
        fetch('http://localhost:3001/addcolumn/' + this.state.board_id, {
            method: 'post',
            body: JSON.stringify({
                token: token,
                column_name: column_name,
                column_position: column_position
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status !== 200) {
                console.log('Something went wrong with fetch adding column');
            }
            return response.json();
        }).then((data) => {

            console.log(data);

            if (data.success) {
                var column = {
                    column_id: data.column_id,
                    column_name: column_name,
                    column_position: column_position
                };
    
                // add column data to redux store
                this.props.createColumn(column);

                this.setState({columnFormOpen: false, columnFormText: ''});
            }
            
        });
    }

    deleteColumn(column_id, card_ids) {
        // logic handled by Column component
        // remove the column & cards from redux store
        this.props.deleteColumn(column_id, card_ids);

    }

    renameColumn(column_id, column_name) {
        // logic handled by Column component
        // rename the column in redux store
        this.props.renameColumn(column_id, column_name);
    }

    addCard(card) {
        //logic handled by Column component
        // add a card to redux store
        this.props.createCard(card);
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
    }

    openCardModal(card_id) {
        this.setState({
            cardModalOpen: true,
            cardModalId: card_id
        });
    }

    closeCardModal() {
        this.setState({
            cardModalOpen: false,
            cardModalId: -1
        });
    }

    deleteBoard() {
        // delete the board

        // fetch

        // redirect to dashboard page
    }

    render() {

        var cards = this.props.cards;

        var columnArray = [];
        columnArray = columnArray.concat(this.props.columns);
        columnArray.sort((col1, col2) => {
            return col1.column_position - col2.column_position;
        });

        // map redux state columns/cards to their proper place
        var columns = columnArray.map((column, index) => {
            var myCards = [];

            // Loop over all cards
            // If current card's parent column is the current column,
            // then add current card to myCards array to be added to column
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].column_id === column.column_id) {
                    myCards.push(cards[i]);
                }
            }

            return <Column name={column.column_name} id={column.column_id} 
                key={index} cards={myCards}
                deleteColumn={(col_id, card_ids) => this.deleteColumn(col_id, card_ids)}
                renameColumn={(col_id, col_name) => this.renameColumn(col_id, col_name)}
                addCard={(card) => this.addCard(card)}
                openCardModal={(card_id) => this.openCardModal(card_id)} />
        });

        var cardModalCard = null;
        if (this.state.cardModalOpen) {
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].card_id === this.state.cardModalId) {
                    cardModalCard = cards[i];
                }
            }
            if (cardModalCard === null) {
                console.log("Card not found for card modal: id " + this.state.cardModalId);
            }
        }

        return(
            <div className="board">
                <div className="container">
                    {!this.state.renameFormOpen
                        ?
                        <h1 className="page-title" onClick={() => this.toggleRenameForm()}>{this.props.boardData.board_name}</h1>
                        :
                        <div className="rename-board-form">
                            <input type="text" id="renameFormInput" value={this.state.renameFormInput} autoFocus 
                                onChange={(e) => this.handleChange(e)}
                                onKeyDown={(e) => {if (e.keyCode === 13) this.renameBoard()}}
                                onFocus={(e) => {e.target.select()}}
                            />
                        </div>

                    }
                    <hr className="title-underline" />
                </div>
                <div className="columns">
                    <div className="columns-container">
                        {columns}
                        <div className="column">
                            <button className="add-column-button" onClick={() => this.toggleColumnForm()}>
                                <h3 className="column-name">Add Column</h3>
                            </button>
                            {this.state.columnFormOpen && 
                                <div className="rename-column-dialog add-column">
                                    <input type="text" value={this.state.columnFormText} 
                                        onChange={(e) => this.handleChange(e)} id="columnFormText" autoFocus
                                        onKeyDown={(e) => {if (e.keyCode === 13) this.addColumn()}} /> 
                                    <button className="text-submit-button" title="Add Column" onClick={() => this.addColumn()}>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                    <BoardMenu name={this.props.boardData.board_name} 
                        toggleRenameForm={() => this.toggleRenameForm()}
                        toggleColumnForm={() => this.toggleColumnForm()} 
                        deleteBoard={() => this.deleteBoard()}
                    />
                </div>
                {this.state.cardModalOpen && 
                    <CardModal id={this.state.cardModalid} card={cardModalCard}
                        user={this.props.user} closeCardModal={() => this.closeCardModal()}   
                    />
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        boardData: state.boardData,
        columns: state.columns,
        cards: state.cards
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        storeBoard: (boardData, columns, cards) => dispatch(storeBoard(boardData, columns, cards)),
        updateBoard: (data, update_type) => dispatch(updateBoard(data, update_type)),
        clearBoard: () => dispatch(clearBoard()),
        createColumn: (column) => dispatch(createColumn(column)),
        deleteColumn: (column_id, card_ids) => dispatch(deleteColumn(column_id, card_ids)),
        renameColumn: (column_id, column_name) => dispatch(renameColumn(column_id, column_name)),
        createCard: (card) => dispatch(createCard(card))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Board);