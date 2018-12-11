import React from 'react'
import { match, Route, RouteComponentProps, Switch } from 'react-router'

export default function App() {
  return (
    <Switch>
      <Route path="/@:login/:projectName" component={ProjectPage} />
      <Route path="/@:login" component={UserPage} />
      <Route path="/" component={MainPage} />
    </Switch>
  )
}

function MainPage() {
  return <h1>欢迎使用 temme!</h1>
}

function UserPage({ match }: RouteComponentProps<{ login: string }>) {
  const { login } = match.params
  return <h1>user page for {login}</h1>
}

function ProjectPage(props: any) {
  console.log(props)
  return <h1>ProjectPage</h1>
}
