import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DashboardTileMenu from './DashboardTileMenu';

class DashboardTile extends Component {

    render() {

        // TODO: MENU BUTTONS DON'T DO ANYTHING
        // TODO: CLICKING A MENU BUTTON TRIGGERS THE LINK

        return(
            <Link to={'/board/' + this.props.id} className="dashboard-tile">
                <p>{this.props.name}</p>
                <DashboardTileMenu />
            </Link>
        );
    }

}

export default DashboardTile;