import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DashboardTileMenu from './DashboardTileMenu';
import DashboardTileRename from './DashboardTileRename';
import DashboardTileDelete from './DashboardTileDelete';

class DashboardTile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            renameFormOpen: false,
            shareFormOpen: false,
            deleteFormOpen: false
        }
    }

    openRenameForm() {
        // toggle rename form, close others
        this.setState({
            renameFormOpen: !this.state.renameFormOpen,
            shareFormOpen: false,
            deleteFormOpen: false
        });
    }

    openShareForm() {
        // toggle share form, close others
        this.setState({
            renameFormOpen: false,
            shareFormOpen: !this.state.shareFormOpen,
            deleteFormOpen: false
        });
    }

    openDeleteForm() {
        // toggle delete form, close others
        this.setState({
            renameFormOpen: false,
            shareFormOpen: false,
            deleteFormOpen: !this.state.deleteFormOpen
        });
    }

    submitRename(newName) {
        var token = localStorage.getItem('kanboard-user-token');
        
        fetch('http://localhost:3001/renameboard', {
            method: 'post',
            body: JSON.stringify({
                token: token,
                new_board_name: newName,
                board_id: this.props.id
            }),
            headers: {
                'content-type': 'application/json' 
            }
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                console.log('Hmm something went wrong with submit rename fetch', response);
                return null;
            }
        }).then((data) => {
            if (data) {
                console.log(data.message);
                
                // close the rename form
                this.setState({renameFormOpen: false});

                // pass new name and id to Dashboard parent component so it can update state
                this.props.renameBoard(data.board_name, data.board_id);
            }
        });
    }

    submitDelete(wantToDelete) {

        this.setState({deleteFormOpen: false});

        if (wantToDelete) {
            var token = localStorage.getItem('kanboard-user-token');

            fetch('http://localhost:3001/deleteboard/' + this.props.id, {
                method: 'post',
                body: JSON.stringify({
                    token: token,
                }),
                headers: {
                    'content-type': 'application/json'
                }
            }).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else {
                    console.log('Hmm something went wrong with submit delete fetch', response);
                    return null;
                }
            }).then((data) => {
                if (data) {
                    console.log(data.message);
                    
                    // close the delete form
                    this.setState({deleteFormOpen: false});

                    // pass id to Dashboard parent component so it can delete board and update state
                    this.props.deleteBoard(this.props.id);
                }
            });
        }
    }

    render() {
        return(
            <div className="dashboard-tile">
                <Link to={'/board/' + this.props.id}>
                    {!this.state.renameFormOpen && !this.state.deleteFormOpen && <p>{this.props.name}</p>}
                </Link>

                {this.state.renameFormOpen && <DashboardTileRename name={this.props.name} submitRename={(newName) => this.submitRename(newName)} />}
                {this.state.deleteFormOpen && <DashboardTileDelete submitDelete={(wantToDelete) => this.submitDelete(wantToDelete)} />}

                <DashboardTileMenu 
                    openRenameForm={() => this.openRenameForm()} 
                    openShareForm={() => this.openShareForm()} 
                    openDeleteForm={() => this.openDeleteForm()} 
                />
            </div>
        );
    }

}

export default DashboardTile;