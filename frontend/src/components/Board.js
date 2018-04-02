import React, { Component } from 'react';
import Column from './Column';
import { connect } from 'react-redux';
import { storeUser } from './../actions'; // make actual action for updating board stuffs
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
            console.log(data.columnData);
            console.log(data.cardData);

            var board_name = data.columnData[0].board_name;

            this.setState({
                board_name: board_name
            });

            // TODO: Store column and card data in redux store

            document.title = 'Kanboard - ' + board_name;
        });
    }


    render() {
        return(
            <div className="board">
                <div className="container">
                    <h1 className="page-title">{this.state.board_name}</h1>
                    <hr className="title-underline" />
                </div>
                <div className="columns-container">
                    <Column name='Backlog' />
                    <Column name='In Progress' />
                    <Column name='Completed' />

                </div>
            </div>
        );
    }
}

export default Board;
