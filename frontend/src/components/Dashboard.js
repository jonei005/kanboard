import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DashboardTile from './DashboardTile';
import './../css/Dashboard.css';

class Dashboard extends Component {

    constructor(props) {
        super(props);

        // replace this with redux store
        this.state = {
            boards: []
        }
    }

    componentDidMount() {
        document.title = 'Kanboard Dashboard';

        var token = localStorage.getItem('kanboard-user-token');

        // send user token, get boards from database based on user id
        // add boards to state (id and name)

        fetch('http://localhost:3001/boards', {
            method: 'post',
            body: JSON.stringify({token: token}),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log('Data: ', data);
            console.log(JSON.parse(data.boards));

            // replace this with redux store?
            var boardsArray = JSON.parse(data.boards);
            this.setState({boards: boardsArray});
        });
    }

    createNewBoard() {
        console.log("Create a new board please!");
        // api call to create new board

        var token = localStorage.getItem('kanboard-user-token');
        var board_name = 'New Board'; // get name 

        fetch('http://localhost:3001/createboard', {
            method: 'post',
            body: JSON.stringify({token: token, board_name: board_name}),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log('Data: ', data);
            console.log('Created board with id: ' + data.board_id);

            var currentBoards = this.state.boards;
            currentBoards.push({board_id: data.board_id, board_name: board_name});
            this.setState({boards: currentBoards});

            // now fetch the board from api again? I already have id and name
        });


        // api call to receive all boards again? (or only the one board?)
        // future: simply add this new board to state


        // append new board to boards array in state
        // var newBoard = {
        //     name: 'New Board', id: 0
        // };
    }

    render() {

        var name = this.props.user.user_name;

        var boards = this.state.boards;

        var boardTiles = boards.map((board, num) => {
            return <DashboardTile name={board.board_name} id={board.board_id} key={num} />
        });

        return (
            <div className="container">
                <h1 className="page-title">{name}'s Dashboard</h1>
                <hr className="title-underline" />
                <div id="dashboard">
                    {boardTiles}
                    <div className="new-board-tile" onClick={() => this.createNewBoard()} title="Create New Board">
                        <p>+</p>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
      user: state.user,
      auth: state.auth
    }
  }

export default withRouter(
    connect(mapStateToProps, null)(Dashboard)
);