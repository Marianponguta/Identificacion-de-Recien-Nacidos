import React from 'react'

import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom"
import PrivateRoute from "./utils/PrivateRoute"
import { AuthProvider } from './context/AuthContext'

import Loginpage from './views/Loginpage'
import Dashboard from './views/Dashboard'
import PatientSearch from './views/PatientSearch'
import PatientRegistration from './views/PatientRegistration'  
import HistoryPage from './views/HistoryPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <PrivateRoute component={Dashboard} path="/dashboard" exact />
          <Route component={Loginpage} path="/login" />
          <Route component={Loginpage} path="/register" exact />
          <Redirect from="/" to="/login" exact />
          <PrivateRoute component={PatientSearch} path="/buscar-paciente" />
          <PrivateRoute component={PatientRegistration} path="/crear-paciente" />
          <PrivateRoute exact path="/historial" component={HistoryPage}/>
        </Switch>
      </AuthProvider>
    </Router>
  )
}

export default App