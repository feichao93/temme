import React, { useEffect } from 'react'
import { match, Route, RouteComponentProps, Switch } from 'react-router'
import { GithubIcon } from './icons'
import './App.styl'
import * as querystring from 'querystring'
import { useSession } from './utils/session'
import ProjectPage from './ProjectPage/ProjectPage'

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
function LoginSuccessPage(props: any) {
  useEffect(() => {
    const {
      location: { search },
    } = props
    const { user_id: userId, username } = querystring.parse(search.substring(1))
    window.opener.postMessage({ userId, username }, window.opener.location)
    window.close()
  })
  return <div>成功登录</div>
}
function MainPage() {
  const { login, logout, connected, username, userId } = useSession()
  const signInClick = () => {
    if (userId !== -1) {
      logout()
    } else {
      login()
    }
  }
  return (
    <div>
      <header>
        <div className="container">
          <div className="align-left">
            <div className="name ">temme</div>
          </div>
          <div className="align-right">
            <button className="button auth" onClick={signInClick}>
              {connected &&
                (userId === -1 ? (
                  <>
                    <GithubIcon />
                    <div style={{ margin: 10 }}>登录</div>
                  </>
                ) : (
                  <>
                    <GithubIcon src="https://github.com/mwindson.png?size=50" />
                    <div style={{ margin: 10 }}>{username}</div>
                  </>
                ))}
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="intro-text">
          <h1>temme 这是介绍文字{connected.toString()}</h1>
        </div>
        <div>{CLIENT_ID}</div>
        <div className="example">some example</div>
      </main>
    </div>
  )
}

function UserPage({ match }: RouteComponentProps<{ login: string }>) {
  const { login } = match.params
  return <h1>user page for {login}</h1>
}
