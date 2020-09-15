import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

import UserChat from './components/UserChat';
import AdminChat from './components/AdminChat';

import './App.css';
import logo from './logo.svg';

class App extends React.Component {

  state = {}

  render () {
    return (
      <Router>
        <div className="container">
            <div className="text-center">
              <img src={logo} className="App-logo" alt="logo" />
              <h1>Rafa's Messaging App!</h1>
              <Route path="/" exact>
                <Link to={`/admin`}>
                  <button type="button" className="btn btn-primary">Enter as Admin</button>
                </Link>
                &nbsp; &nbsp;
                <Link to={`/user`}>
                  <button type="button" className="btn btn-primary">Enter as User</button>
                </Link>
              </Route>
              <Route path="/user" component={UserChat}>
              </Route>
              <Route path="/admin" component={AdminChat}>
              </Route>
            </div>
    
        </div>
      </Router>
    );
  }
}

export default App;
