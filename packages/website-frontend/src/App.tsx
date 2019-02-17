import React from 'react'
import { Route, Switch } from 'react-router'
import './App.styl'
import LoginSuccessPage from './LoginSuccessPage'
import MainPage from './MainPage'
import UserPage from './UserPage'

const ProjectPage = React.lazy(() => import('./ProjectPage/ProjectPage'))

export default function App() {
  return (
    <Switch>
      <Route path="/login-success" component={LoginSuccessPage} />
      <Route
        path="/@:login/:projectName"
        render={({ match: { params, url } }) => (
          <React.Suspense fallback="loading...">
            <ProjectPage key={url} {...params} />
          </React.Suspense>
        )}
      />
      <Route path="/@:login" component={UserPage} />
      <Route path="/" component={MainPage} />
    </Switch>
  )
}
