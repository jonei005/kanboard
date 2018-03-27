import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './actions';
import Routes from './routes';
import Navigation from './components/Navigation';
import './css/App.css';

// App component that loads the router
class App extends Component {
  render() {
    return (
      <div className="App">
        <Navigation auth={this.props.auth}/>
        <Routes />
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
  connect(mapStateToProps, actions)(App)
);

