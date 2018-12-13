import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router'
import { GithubIcon } from './icons'
import './App.styl'
import * as querystring from 'querystring'
import { useSession } from './utils/session'
import UserPage from './UserPage'
import ProjectPage from './ProjectPage/ProjectPage'

export default function App() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/login-success" component={LoginSuccessPage} />
        <Route path="/@:login/:projectName" component={ProjectPage} />
        <Route path="/@:login" component={UserPage} />
        <Route path="/" component={MainPage} />
      </Switch>
    </>
  )
}
function Header() {
  const { login, connected, username, userId } = useSession()
  return (
    <div className="title-bar">
      <div className="container">
        <div className="align-left">
          <div className="name">
            <a href="/">temme</a>
          </div>
        </div>
        <div className="align-right">
          {connected &&
            (userId === -1 ? (
              <button className="button auth" onClick={login}>
                <GithubIcon />
                <div style={{ margin: 10 }}>登录</div>
              </button>
            ) : (
              <a href={`/@${username}`} className="button auth">
                <GithubIcon src="https://github.com/mwindson.png?size=50" />
                <div style={{ margin: 10 }}>{username}</div>
              </a>
            ))}
        </div>
      </div>
    </div>
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
  return (
    <>
      <div className="main-page">
        <div className="intro-text">
          <h1>temme 这是介绍文字</h1>
        </div>
        <div>{CLIENT_ID}</div>
        <div className="example">some example</div>
      </div>
    </>
  )
}
