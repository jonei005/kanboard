import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import Landing from './../components/Landing';
import Login from './../components/Login';
import Register from './../components/Register';
import About from './../components/About';

export default () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path='/' component={Landing} />
                <Route exact path='/login' component={Login} />
                <Route exact path='/register' component={Register} />
                <Route exact path='/about' component={About} />
            </Switch>
        </BrowserRouter>
    );
}