import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Landing from './../components/Landing';
import Login from './../components/Login';
import Register from './../components/Register';
import About from './../components/About';
import Dashboard from './../components/Dashboard';

export default () => {
    return (
        <Switch>
            <Route exact path='/' component={Landing} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/about' component={About} />
            <Route exact path='/dashboard' component={Dashboard} />
        </Switch>
    );
}