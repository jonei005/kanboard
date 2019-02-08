import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DashboardTileMenu from './DashboardTileMenu';
import DashboardTileRename from './DashboardTileRename';
import DashboardTileDelete from './DashboardTileDelete';
import api from './../constants/api';

class DashboardTile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            renameFormOpen: false,
            shareModalOpen: false,
            deleteFormOpen: false
        }
    }

    openRenameForm() {
        // toggle rename form, close others
        this.setState({
            renameFormOpen: !this.state.renameFormOpen,
            shareModalOpen: false,
            deleteFormOpen: false
        });
    }

    openShareModal() {
        // toggle share form, close others
        this.setState({
            renameFormOpen: false,
            shareModalOpen: !this.state.shareModalOpen,
            deleteFormOpen: false
        });

        this.props.toggleShareModal(this.props.name, this.props.id);
    }

    openDeleteForm() {
        // toggle delete form, close others
        this.setState({
            renameFormOpen: false,
            shareModalOpen: false,
            deleteFormOpen: !this.state.deleteFormOpen
        });
    }

    submitRename(newName) {

        if (newName.length === 0 || newName === this.props.name) {
            this.setState({renameFormOpen: false});
            return;
        }

        var token = localStorage.getItem('kanboard-user-token');
        
        fetch(api + '/renameboard/' + this.props.id, {
            method: 'post',
            body: JSON.stringify({
                token: token,
                new_board_name: newName,
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

            fetch(api + '/deleteboard/' + this.props.id, {
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

                    // pass id to Dashboard parent component so it can delete board and update state
                    this.props.deleteBoard(this.props.id);
                }
            });
        }
    }

    submitUnlink(wantToUnlink) {
        this.setState({deleteFormOpen: false});

        if (wantToUnlink) {
            fetch(api + '/unlinkboard/' + this.props.id, {
                method: 'post',
                body: JSON.stringify({
                    token: localStorage.getItem('kanboard-user-token')
                }),
                headers: {
                    'content-type': 'application/json' 
                }
            }).then((response) => {
                if (response.status !== 200) {
                    console.log('Something went wrong with fetch unlink board');
                }
                return response.json();
            }).then((data) => {
                if (data) {
                    console.log(data.message);

                    this.props.unlinkBoard(this.props.id);
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

                {this.state.renameFormOpen && 
                    <DashboardTileRename name={this.props.name} 
                        submitRename={(newName) => this.submitRename(newName)} 
                    />
                }

                {this.state.deleteFormOpen && 
                    <DashboardTileDelete owned={this.props.owned} 
                        submitDelete={(wantToDelete) => this.submitDelete(wantToDelete)} 
                        submitUnlink={(wantToUnlink) => this.submitUnlink(wantToUnlink)}
                    />
                }

                <DashboardTileMenu owned={this.props.owned}
                    openRenameForm={() => this.openRenameForm()} 
                    openShareModal={() => this.openShareModal()} 
                    openDeleteForm={() => this.openDeleteForm()} 
                    closeShareModal={() => this.setState({shareModalOpen: false})}
                />
            </div>
        );
    }

}

export default DashboardTile;