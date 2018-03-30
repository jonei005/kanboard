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

        fetch('http://localhost:3001/boards', {
            method: 'post',
            body: JSON.stringify({token: token}),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            console.log('Response: ', response);
            return response.json();
        }).then((data) => {
            console.log('Data: ', data);
            console.log(JSON.parse(data.boards));

            // replace this with redux store
            var boardsArray = JSON.parse(data.boards);
            this.setState({boards: boardsArray});
        })

        // send user token and get boards from database based on user id

        // add boards to state (id and name)

        // use action GET_BOARDS or similar

        // keep in state forever (until logout) as it doesn't take a lot of memory
    }

    createNewBoard() {
        console.log("Create a new board please!");
        // api call to create new board

        // receive board back from database with ID


        // append new board to boards array in state
        // var newBoard = {
        //     name: 'New Board', id: 0
        // };
    }

    render() {

        

        var name = this.props.user.user_name;

        // var boards = [
        //     { name: 'Javascript', id: 1 },
        //     { name: 'React', id: 2 },
        //     { name: 'Redux', id: 3 },
        //     { name: 'Node', id: 4 },
        //     { name: 'Express', id: 5 },
        //     { name: 'Postgres', id: 6 }
        // ];

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