import React, { Component } from 'react';
import Column from './Column';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { 
    storeBoard, clearBoard,
    createColumn, deleteColumn, updateColumn
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
            columnFormText: ''
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

            console.log(data.message);
            // console.log(data.boardData);
            // console.log(data.columnData);
            // console.log(data.cardData);

            // store board, column, card data in redux store
            this.props.storeBoard(data.boardData, data.columnData, data.cardData);

            
        });
    }

    componentWillUnmount() {
        // remove the board, column, and card data from redux store
        this.props.clearBoard();
    }

    toggleColumnForm() {
        this.setState({columnFormOpen: !this.state.columnFormOpen});
    }

    addColumn() {
        // alert('add column');

        this.setState({columnFormOpen: false});
        
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
            }
            
        });
    }

    deleteColumn(column_id, card_ids) {
        // logic handled by Column component
        // my job here is just to remove the column & cards from redux store
        this.props.deleteColumn(column_id, card_ids);

    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }


    render() {

        var cards = this.props.cards;

        // map redux state columns/cards to their proper place
        var columns = this.props.columns.map((column, index) => {
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
                deleteColumn={(col_id, card_ids) => this.deleteColumn(col_id, card_ids)} />
        });

        // TODO: create/delete columns

        return(
            <div className="board">
                <div className="container">
                    <h1 className="page-title">{this.props.boardData.board_name}</h1>
                    <hr className="title-underline" />
                </div>
                <div className="columns-container">
                    {columns}
                    <div className="column">
                        <button className="add-column-button" onClick={() => this.toggleColumnForm()}>
                            <h3 className="column-name">Add Column</h3>
                        </button>
                        {this.state.columnFormOpen && 
                            <div className="dashboard-tile-rename-form">
                                <input type="text" value={this.state.columnFormText} 
                                    onChange={this.handleChange} id="columnFormText" autoFocus /> 
                                <button className="text-submit-button" title="Add Board" onClick={() => this.addColumn()}>
                                    <i className="far fa-check-circle fa-lg"></i>
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
      boardData: state.boardData,
      columns: state.columns,
      cards: state.cards
    }
  }

const mapDispatchToProps = (dispatch) => {
    return {
        storeBoard: (boardData, columns, cards) => dispatch(storeBoard(boardData, columns, cards)),
        clearBoard: () => dispatch(clearBoard()),
        createColumn: (column) => dispatch(createColumn(column)),
        deleteColumn: (column_id, card_ids) => dispatch(deleteColumn(column_id, card_ids)),
        updateColumn: (column) => dispatch(updateColumn(column))
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Board)
);