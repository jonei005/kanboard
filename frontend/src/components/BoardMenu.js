import React, { Component } from 'react';

class BoardMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            description: ''
        }
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
                        <button>Rename Board</button>
                        <button>Add Column</button>
                        <button>Delete Column</button>
                        <button>Option 4</button>
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