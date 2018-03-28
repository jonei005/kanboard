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
            { name: 'Javascript', id: 1 },
            { name: 'React', id: 2 },
            { name: 'Redux', id: 3 },
            { name: 'Node', id: 4 },
            { name: 'Express', id: 5 },
            { name: 'Postgres', id: 6 }
        ];

        var boardTiles = boards.map((board, num) => {
            return <DashboardTile name={board.name} id={board.id} key={num} />
        });

        return (
            <div className="container">
                <h1 className="page-title">{name}'s Dashboard</h1>
                <hr className="title-underline" />
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