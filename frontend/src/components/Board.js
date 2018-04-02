import React, { Component } from 'react';
import Column from './Column';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { storeBoard, clearBoard } from './../actions'; // make actual action for updating board stuffs
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
            board_data: {}
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
            console.log(data.message);
            // console.log(data.boardData);
            // console.log(data.columnData);
            // console.log(data.cardData);

            // store board, column, card data in redux store
            this.props.storeBoard(data.boardData, data.columnData, data.cardData);

            document.title = 'Kanboard - ' + data.boardData.board_name;
        });
    }

    componentWillUnmount() {
        // remove the board, column, and card data from redux store
        this.props.clearBoard();
    }


    render() {

        var cards = this.props.cards;

        // TODO: map redux state columns/cards to their proper place
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
                key={index} cards={myCards} />
        });

        return(
            <div className="board">
                <div className="container">
                    <h1 className="page-title">{this.props.boardData.board_name}</h1>
                    <hr className="title-underline" />
                </div>
                <div className="columns-container">
                    {columns}
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
        clearBoard: () => dispatch(clearBoard())
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Board)
);