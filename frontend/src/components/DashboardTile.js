import React, { Component } from 'react';
// import { Link } from 'react-router-dom';

class DashboardTile extends Component {

    render() {
        return(
            <div className="dashboard-tile">
                <p>{this.props.name}</p>
            </div>
        );
    }

}

export default DashboardTile;