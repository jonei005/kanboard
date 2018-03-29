import React, { Component } from 'react';

class DashboardTileMenu extends Component {

    openRenameForm() {
        this.props.openRenameForm();
    }

    openShareForm() {
        this.props.openShareForm();
    }

    openDeleteForm() {
        this.props.openDeleteForm();
    }

    render() {
        return(
            <div className="dashboard-tile-menu">
                <div className="dashboard-tile-menu-button" title="Rename Board" onClick={() => this.openRenameForm()}>
                    <i className="fas fa-edit"></i>
                </div>
                <div className="dashboard-tile-menu-button" title="Share Board" onClick={() => this.openShareForm()}>
                    <i className="fas fa-share-alt"></i>
                </div>
                <div className="dashboard-tile-menu-button" title="Delete Board" onClick={() => this.openDeleteForm()}>
                    <i className="far fa-trash-alt"></i>
                </div>
            </div>
        );
    }
}

export default DashboardTileMenu;