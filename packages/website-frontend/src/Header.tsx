import {
  AnchorButton,
  Button,
  Menu,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Popover,
} from '@blueprintjs/core'
import React from 'react'
import history from './utils/history'
import { useSession } from './utils/session'

export default function Header() {
  const { login, connected, username, userId, logout } = useSession()

  return (
    <Navbar fixedToTop>
      <NavbarGroup>
        <NavbarHeading>Temme</NavbarHeading>
        <NavbarDivider />
        <AnchorButton
          minimal
          icon="home"
          text="主页"
          href="/"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            history.push('/')
          }}
        />
        <AnchorButton
          minimal
          icon="git-repo"
          text="GitHub"
          href="https://github.com/shinima/temme"
          target="_blank"
        />
        <AnchorButton
          minimal
          icon="manual"
          text="文档"
          href="https://github.com/shinima/temme#%E6%96%87%E6%A1%A3%E9%93%BE%E6%8E%A5"
          target="_blank"
        />
      </NavbarGroup>
      <NavbarGroup align="right">
        {connected && userId === -1 && (
          <Button minimal icon="log-in" intent="primary" text="使用 GitHub 登录" onClick={login} />
        )}
        {connected && userId != -1 && (
          <Popover
            content={
              <Menu>
                <Menu.Item
                  icon="cube"
                  text="我的项目"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    history.push(`/@${username}`)
                  }}
                  href={`/@${username}`}
                />
                <Menu.Item icon="log-out" text="登出" onClick={logout} />
              </Menu>
            }
            position="bottom-right"
            minimal
          >
            <Button minimal icon="user" text={username} rightIcon="caret-down" />
          </Popover>
        )}
      </NavbarGroup>
    </Navbar>
  )
}
