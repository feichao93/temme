import React from 'react'
import { Route, Switch } from 'react-router'
import UserPage from './UserPage'
import ProjectPage from './ProjectPage/ProjectPage'
import LoginSuccessPage from './LoginSuccessPage'
import MainPage from './MainPage'
import './App.styl'

export default function App() {
  return (
    <Switch>
      <Route path="/login-success" component={LoginSuccessPage} />
      <Route path="/@:login/:projectName" component={ProjectPage} />
      <Route path="/@:login" component={UserPage} />
      <Route path="/" component={MainPage} />
    </Switch>
  )
}
