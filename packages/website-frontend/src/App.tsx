import { Spinner } from '@blueprintjs/core'
import React from 'react'
import { Route, Switch } from 'react-router'
import './App.styl'
import LoginSuccessPage from './LoginSuccessPage'
import MainPage from './MainPage'
import UserPage from './UserPage'

const ProjectPage = React.lazy(() => import('./ProjectPage/ProjectPage'))

function LoadingEditor() {
  return (
    <div style={{ margin: 'auto', marginTop: 50 }}>
      <Spinner />
      <p style={{ textAlign: 'center', fontSize: 20, marginTop: 16 }}>编辑器载入中，请稍后</p>
    </div>
  )
}

export default function App() {
  return (
    <Switch>
      <Route path="/login-success" component={LoginSuccessPage} />
      <Route
        path="/@:login/:projectName"
        render={({ match: { params, url } }) => (
          <React.Suspense fallback={<LoadingEditor />}>
            <ProjectPage key={url} login={params.login} projectName={params.projectName} />
          </React.Suspense>
        )}
      />
      <Route path="/@:login" component={UserPage} />
      <Route path="/" component={MainPage} />
    </Switch>
  )
}
