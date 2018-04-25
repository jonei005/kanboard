import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DashboardTile from './DashboardTile';
import ShareBoardModal from './ShareBoardModal';
import './../css/Dashboard.css';
import './../css/ShareBoardModal.css';

class Dashboard extends Component {

    constructor(props) {
        super(props);

        // replace this with redux store
        this.state = {
            boards: [],
            sharedBoards: [],
            shareModalOpen: false,
            shareModalBoardName: '',
            shareModalBoardId: -1
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

            // replace this with redux store?
            // var ownedBoardsArray = JSON.parse(data.boards);

            this.setState({
                boards: data.owned_boards,
                sharedBoards: data.shared_boards
            });
        });
    }

    createNewBoard() {
        console.log("Create a new board please!");
        // api call to create new board

        var token = localStorage.getItem('kanboard-user-token');
        var board_name = 'New Board'; // get name 
        var board_position = this.state.boards.length;

        fetch('http://localhost:3001/createboard', {
            method: 'post',
            body: JSON.stringify({
                token: token, 
                board_name: board_name,
                board_position: board_position
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log('Data: ', data);
            console.log('Created board with id: ' + data.board_id);

            // add new board to the component state
            var currentBoards = this.state.boards;
            currentBoards.push({
                board_id: data.board_id, 
                board_name: board_name,
                board_position: board_position
            });

            this.setState({boards: currentBoards});
        });
    }

    renameBoard(newName, id) {
        // rename api call is handled in DashboardTile component
    
        var currentBoards = this.state.boards;
        var boardFound = false;

        for (var i = 0; i < currentBoards.length; i++) {
            if (currentBoards[i].board_id === id) {
                boardFound = true;
                currentBoards[i].board_name = newName;
            }
        }

        if (boardFound) {
            this.setState({boards: currentBoards});
        }
        else {
            console.log('renameBoard error: board id not found');
        }
    }

    deleteBoard(id) {
        // delete api call is handled in DashboardTile component

        var currentBoards = this.state.boards;
        var deleteIndex = -1;
        
        for (var i = 0; i < currentBoards.length; i++) {
            if (currentBoards[i].board_id === id) {
                deleteIndex = i;
            }
        }

        if (deleteIndex > -1) {
            // remove that element of array
            currentBoards.splice(deleteIndex, 1);
            this.setState({boards: currentBoards});
        }
    }

    toggleShareModal(board_name, board_id) {
        this.setState({
            shareModalOpen: !this.state.shareModalOpen,
            shareModalBoardName: board_name,
            shareModalBoardId: board_id
        });
    }

    render() {

        // get user name from redux store
        var name = this.props.user.user_name;

        // get list of boards from component state, sort, map them to <DashboardTile> components
        var boards = this.state.boards;
        boards.sort((board1, board2) => {
            return board1.board_position - board2.board_position;
        })

        var boardTiles = boards.map((board, num) => {
            return (
                <DashboardTile key={num} name={board.board_name}  
                    position={board.board_position} id={board.board_id}
                    renameBoard={(newName, id) => this.renameBoard(newName, id)}
                    deleteBoard={(id) => this.deleteBoard(id)} 
                    toggleShareModal={(name, id) => this.toggleShareModal(name, id)}
                />
            )
        });

        var sharedBoards = this.state.sharedBoards;

        var sharedBoardTiles = sharedBoards.map((board, num) => {
            return (
                <DashboardTile key={num} name={board.board_name}  
                    position={board.board_position} id={board.board_id}
                    renameBoard={(newName, id) => this.renameBoard(newName, id)}
                    deleteBoard={(id) => this.deleteBoard(id)} 
                    toggleShareModal={(name, id) => this.toggleShareModal(name, id)}
                />
            )
        })

        return (
            <div className="container">
                <h1 className="page-title">{name}'s Dashboard</h1>
                <hr className="title-underline" />
                <h3 className="dashboard-title">My Boards</h3>
                <div id="dashboard">
                    {boardTiles}
                    <div className="new-board-tile" onClick={() => this.createNewBoard()} title="Create New Board">
                        <p><i className="fas fa-plus"></i></p>
                    </div>
                </div>
                {this.sharedBoardTiles && this.sharedBoardTiles.length > 0 &&
                    <div className="dashboard-shared-boards">
                        <h3 className="dashboard-title">Shared With Me</h3>
                        <div id="dashboard">
                            {sharedBoardTiles}
                        </div>
                    </div>
                }
                

                {this.state.shareModalOpen &&
                    <ShareBoardModal name={this.state.shareModalBoardName} id={this.state.shareModalBoardId}
                        toggleShareModal={() => this.toggleShareModal()}

                    />
                }
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