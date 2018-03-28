import React, { Component } from 'react';

class DashboardTileMenu extends Component {

    openRenameForm(e) {
        console.log("I would like to rename this board please.");
        e.stopPropagation();
    }

    render() {
        return(
            <div className="dashboard-tile-menu">
                <div className="dashboard-tile-menu-button" title="Rename Board" onClick={(e) => this.openRenameForm}>
                    <i className="fas fa-edit"></i>
                </div>
                <div className="dashboard-tile-menu-button" title="Share Board">
                    <i className="fas fa-share-alt"></i>
                </div>
                <div className="dashboard-tile-menu-button" title="Delete Board">
                    <i className="far fa-trash-alt"></i>
                </div>
            </div>
        );
    }
}

export default DashboardTileMenu;