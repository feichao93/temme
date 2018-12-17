import { useSession } from './utils/session'
import { Link } from 'react-router-dom'
import { GithubIcon } from './icons'
import React from 'react'

export default function Header() {
  const { login, connected, username, userId } = useSession()

  return (
    <div className="title-bar">
      <div className="container">
        <div className="align-left">
          <div className="name">
            <Link to="/">temme</Link>
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
              <Link to={`/@${username}`} className="button auth">
                <img
                  alt="icon"
                  src={`https://github.com/${username}.png?size=40`}
                  width={20}
                  height={20}
                />
                <div style={{ margin: 10 }}>{username}</div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
