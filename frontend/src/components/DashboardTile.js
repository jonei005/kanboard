import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DashboardTileMenu from './DashboardTileMenu';
import DashboardTileRename from './DashboardTileRename';

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
        this.setState({renameFormOpen: !this.state.renameFormOpen});
    }

    openShareForm() {
        this.setState({shareFormOpen: !this.state.shareFormOpen});
    }

    openDeleteForm() {
        this.setState({deleteFormOpen: !this.state.deleteFormOpen});
    }

    submitRename(newName) {
        this.setState({renameFormOpen: false});
    }

    render() {

        

        return(
            <div className="dashboard-tile">
                <Link to={'/board/' + this.props.id}>
                    {!this.state.renameFormOpen && <p>{this.props.name}</p>}
                </Link>

                {this.state.renameFormOpen && <DashboardTileRename name={this.props.name} submitRename={(newName) => this.submitRename(newName)} />}

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