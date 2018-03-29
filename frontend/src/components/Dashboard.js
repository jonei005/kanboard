import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DashboardTile from './DashboardTile';
import './../css/Dashboard.css';

class Dashboard extends Component {

    componentDidMount() {
        document.title = 'Kanboard Dashboard';

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

        var boards = [
            { name: 'Javascript', id: 1 },
            { name: 'React', id: 2 },
            { name: 'Redux', id: 3 },
            { name: 'Node', id: 4 },
            { name: 'Express', id: 5 },
            { name: 'Postgres', id: 6 }
        ];

        var boardTiles = boards.map((board, num) => {
            return <DashboardTile name={board.name} id={board.id} key={num} />
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