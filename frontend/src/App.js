import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Routes from './routes';
import Navigation from './components/Navigation';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import About from './components/About';
import './css/App.css';

// App component that loads the router
class App extends Component {
  render() {
    return (
      <div className="App">
        <Navigation />
        <Main />
      </div>
    );
  }
}

// Main component used as a router
const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={ Landing } />
      <Route exact path='/login' component={ Login } />
      <Route exact path='/register' component={ Register } />
      <Route exact path='/about' component={ About } />
    </Switch>
  </main>
)

export default App;

