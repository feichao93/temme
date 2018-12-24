import { useSession } from './utils/session'
import { Link } from 'react-router-dom'
import { GithubIcon } from './icons'
import React from 'react'
import './Header.styl'

export default function Header() {
  const { login, connected, username, userId } = useSession()

  return (
    <div className="nav-bar">
      <div className="container">
        <div className="align-left">
          <div className="logo">
            <Link to="/">Temme</Link>
          </div>
          <a href="https://github.com/shinima/temme" target="_blank" className="nav-link">
            Github
          </a>
          <a
            href="https://github.com/shinima/temme#%E6%96%87%E6%A1%A3%E9%93%BE%E6%8E%A5"
            target="_blank"
            className="nav-link"
          >
            Docs
          </a>
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
