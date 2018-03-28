import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import DashboardTile from './DashboardTile';
import './../css/Dashboard.css';

class Dashboard extends Component {

    componentDidMount() {
        document.title = 'Kanboard Dashboard';
    }

    render() {

        var name = this.props.user.user_name;

        var boards = [
            'Tile 1',
            'Tile 2',
            'Tile 3',
            'Tile 4',
            'Tile 5',
            'Tile 6'
        ];

        var boardTiles = boards.map((board, num) => {
            return <DashboardTile name={board} key={num} />
        });

        return (
            <div className="container">
                <h1 className="page-title">{name}'s Dashboard</h1>
                <hr className="title-underline" />
                <p>Dashboard!</p>
                <div id="dashboard">
                    {boardTiles}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
      user: state.user,
      auth: state.auth
    }
  }

export default withRouter(
    connect(mapStateToProps, null)(Dashboard)
);