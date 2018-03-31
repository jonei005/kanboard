import React, { Component } from 'react';

class DashboardTileDelete extends Component {

    render() {
        return(
            <div className="dashboard-tile-delete-form">
                <button className="board-delete-button delete" title="Delete Board" onClick={() => this.props.submitDelete(true)}>
                    Confirm Delete <i className="fas fa-check"></i>
                </button> 
                <button className="board-delete-button cancel" title="Cancel" onClick={() => this.props.submitDelete(false)}>
                    Cancel <i className="fas fa-ban"></i>
                </button>
            </div>
            
        );
    }
}

export default DashboardTileDelete;