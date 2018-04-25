import React, { Component } from 'react';

class DashboardTileDelete extends Component {

    render() {
        if (this.props.owned) {
            return(
                <div className="dashboard-tile-delete-form">
                    <button className="board-delete-button delete" title="Delete Board" onClick={() => this.props.submitDelete(true)}>
                        Delete Board <i className="fas fa-check"></i>
                    </button> 
                    <button className="board-delete-button cancel" title="Cancel" onClick={() => this.props.submitDelete(false)}>
                        Cancel <i className="fas fa-ban"></i>
                    </button>
                </div>
                
            );
        }
        else {
            return(
                <div className="dashboard-tile-delete-form">
                    <button className="board-delete-button delete" title="Unlink From Board" onClick={() => this.props.submitUnlink(true)}>
                        Unlink Board <i className="fas fa-check"></i>
                    </button> 
                    <button className="board-delete-button cancel" title="Cancel" onClick={() => this.props.submitDelete(false)}>
                        Cancel <i className="fas fa-ban"></i>
                    </button>
                </div>
                
            );
        }
        
    }
}

export default DashboardTileDelete;