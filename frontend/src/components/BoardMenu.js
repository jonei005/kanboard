import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class BoardMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            description: props.description,
            members: [],
            owner: {},
            deleteBoardFormOpen: false,
            editDescriptionFormOpen: false,
            descriptionFormInput: this.props.description
        }
    }

    componentDidMount() {
        // get owner and members of the board
        fetch('http://localhost:3001/boardmembers/' + this.props.id, {
            method: 'post',
            body: JSON.stringify({token: localStorage.getItem('kanboard-user-token')}),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with get members fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);

                this.setState({
                    members: data.board_members,
                    owner: data.board_owner
                });
            }
        });
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

        // var usersArray = [
        //     {name: 'Jeremy'},
        //     {name: 'Jeff'},
        //     {name: 'Some Other Guy'},
        //     {name: 'Sample User'}
        // ];
        
        var membersArray = this.state.members || null;
        var members = [];
        
        if (membersArray) {
            members = membersArray.sort((member1, member2) => {
                return member1.user_name.toLowerCase() > member2.user_name.toLowerCase();
            });

            members = membersArray.map((member, index) => {
                return (
                    <Link to={"/user/" + member.user_id} key={index} className="board-member">
                        {member.user_name}
                    </Link>
                )
            });
        }
        
        
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
                        {members}
                    </div>
                </div>
            </div>
        )
    }
}

export default BoardMenu;