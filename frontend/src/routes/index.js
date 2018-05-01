import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Landing from './../components/Landing';
import Login from './../components/Login';
import Register from './../components/Register';
import About from './../components/About';
import Account from './../components/Account';
import Dashboard from './../components/Dashboard';
import Board from './../components/Board';
import User from './../components/User';

export default () => {
    return (
        <Switch>
            <Route exact path='/' component={Landing} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/about' component={About} />
            <Route exact path='/account' component={Account} />
            <Route exact path='/dashboard' component={Dashboard} />
            <Route exact path='/board' component={Board} /> 
            <Route path='/board/:id' component={Board} />
            <Route path='/user/:id' component={User} />
        </Switch>
    );
}