import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { storeUser, clearUser } from './actions';
import Routes from './routes';
import Navigation from './components/Navigation';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import './css/App.css';

// App component that loads the router
class App extends Component {

  componentWillMount() {
    // check user token and send it up to api to verify user is authenticated
    var token = localStorage.getItem('kanboard-user-token') || null;
    
    if (token) {
      fetch('http://localhost:3001/user', {
        method: 'post',
        body: JSON.stringify({token: token}),
        headers: {
          "content-type": "application/json"
        }
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        else {
          return null;
        }
      }).then((data) => {
        if (data && data.auth === true) {
          console.log(data.message);
          this.props.storeUser(data.user);
        }
        else if (data && data.auth === false) {
          console.log(data.message);
          localStorage.removeItem('kanboard-user-token');
          this.props.clearUser();
        }
      });
    }
  }

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

const mapDispatchToProps = (dispatch) => {
  return {
      storeUser: (user) => dispatch(storeUser(user)),
      clearUser: () => dispatch(clearUser)
  }
}

App = DragDropContext(HTML5Backend)(App);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(App)
);

