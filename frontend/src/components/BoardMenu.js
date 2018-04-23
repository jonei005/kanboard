import React, { Component } from 'react';

class BoardMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            description: '',
            deleteBoardFormOpen: false
        }
    }

    toggleDeleteBoardForm() {
        this.setState({deleteBoardFormOpen: !this.state.deleteBoardFormOpen});
    }

    deleteBoard() {
        this.setState({deleteBoardFormOpen: false});
        this.props.deleteBoard();
    }

    render() {

        var usersArray = [
            {name: 'Jeremy'},
            {name: 'Jeff'},
            {name: 'Some Other Guy'},
            {name: 'Sample User'}
        ];
        
        var users = usersArray.map((user, index) => {
            return <li key={index}>{user.name}</li>
        });
        
        var sampleDescription = "This is a sample board description. Click here to write your own description. It is beneficial to describe the mission of the board to all users.";
        var description = this.state.description || sampleDescription;


        return(
            <div className="board-menu-container">
                <div className="board-menu">
                    <div className="board-menu-description">
                        <h3 className="board-menu-title">
                            <i className="fas fa-align-left fa-sm"></i> Board Description
                        </h3>
                        <p>{description}</p>
                    </div>
                    <div className="board-menu-options">
                        <h3 className="board-menu-title">
                            <i className="fas fa-cog fa-sm"></i> Board Options
                        </h3>
                        <button id="menu-rename-board-button" onClick={() => this.props.toggleRenameForm()}>Rename Board</button>
                        <button id="menu-add-column-button" onClick={() => this.props.toggleColumnForm()}>Add Column</button>
                        <button id="menu-delete-board-button" onClick={() => this.toggleDeleteBoardForm()}>Delete Board</button>
                        {this.state.deleteBoardFormOpen &&
                            <div className="delete-board-form">
                                <p>Warning:</p>
                                <p>Are you sure you want to delete your board, <span>{this.props.name}</span>? This can not be undone. All data, including all card descriptions and comments, will be erased forever.</p>
                                <button className="delete-board-button" onClick={() => this.deleteBoard()}>Delete Board</button>
                                <button className="cancel-delete-board-button" onClick={() => this.toggleDeleteBoardForm()}>Cancel</button>
                            </div>
                        }
                    </div>
                    <div className="board-menu-members">
                        <h3 className="board-menu-title">
                            <i className="far fa-user fa-sm"></i> Board Members
                        </h3>
                        <ul>
                            {users}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

export default BoardMenu;