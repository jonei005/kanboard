import React, { Component } from 'react';

class BoardMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            description: props.description,
            deleteBoardFormOpen: false,
            editDescriptionFormOpen: false,
            descriptionFormInput: this.props.description
        }
    }

    toggleDeleteBoardForm() {
        this.setState({deleteBoardFormOpen: !this.state.deleteBoardFormOpen});
    }

    deleteBoard() {
        this.setState({deleteBoardFormOpen: false});
        this.props.deleteBoard();
    }

    toggleEditDescriptionForm() {
        this.setState({
            editDescriptionFormOpen: !this.state.editDescriptionFormOpen,
            descriptionFormInput: this.props.description
        });
    }

    editDescription() {
        var new_description = this.state.descriptionFormInput;

        if (new_description === this.props.description) {
            this.setState({editDescriptionFormOpen: false});
            return;
        }

        this.props.editBoardDescription(new_description);

        this.setState({editDescriptionFormOpen: false});
    }

    handleChange = (e) => {
        this.setState({[e.target.id]: e.target.value});
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
        
        // var sampleDescription = "This is a sample board description. Click here to write your own description. It is beneficial to describe the mission of the board to all users.";
        var description = this.props.description || "Click here to add a description.";


        return(
            <div className="board-menu-container">
                <div className="board-menu">
                    <div className="board-menu-description">
                        <h3 className="board-menu-title">
                            <i className="fas fa-align-left fa-sm"></i> Board Description
                        </h3>
                        {!this.state.editDescriptionFormOpen
                            ?
                            <p className="board-description" onClick={() => this.toggleEditDescriptionForm()}>{description}</p>
                            :
                            <div className="edit-board-description-form">
                                <textarea value={this.state.descriptionFormInput} autoFocus rows="8" id="descriptionFormInput"
                                    placeholder="Write a description of your board"
                                    onChange={(e) => this.handleChange(e)}
                                    onKeyDown={(e) => {if (e.keyCode === 13 && e.ctrlKey) this.editDescription()}}
                                />
                                <button onClick={() => this.editDescription()} className="edit-board-description-button">
                                    Save Description <i className="fas fa-check"></i>
                                </button>
                                
                                <button onClick={() => this.toggleEditDescriptionForm()} className="cancel-edit-board-description-button">
                                    Cancel <i className="fas fa-ban"></i>
                                </button>
                            </div>
                        }
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