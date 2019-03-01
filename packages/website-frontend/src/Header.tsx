import {
  AnchorButton,
  Button,
  Classes,
  Menu,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Popover,
} from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import history from './utils/history'
import { useSession } from './utils/session'

export function NavPartContent() {
  return (
    <>
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
    </>
  )
}

export function UserPartContent() {
  const session = useSession()
  const { loggingIn, connected, userId } = session

  if (!connected) {
    return null
  }
  if (loggingIn) {
    return <Button minimal loading style={{ width: 120 }} />
  }
  if (userId === -1) {
    return (
      <Button
        minimal
        icon="log-in"
        intent="primary"
        text="使用 GitHub 登录"
        onClick={session.login}
      />
    )
  }

  return (
    <Popover
      content={
        <Menu>
          <Menu.Item
            icon="cube"
            text="个人页面"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              history.push(`/@${session.username}`)
            }}
            href={`/@${session.username}`}
          />
          <Menu.Item icon="log-out" text="登出" onClick={session.logout} />
        </Menu>
      }
      position="bottom-right"
      minimal
    >
      <Button minimal icon="user" text={session.username} rightIcon="caret-down" />
    </Popover>
  )
}

export interface HeaderProps {
  dark?: boolean
}

export default function Header({ dark }: HeaderProps) {
  return (
    <Navbar fixedToTop className={classNames({ [Classes.DARK]: dark })}>
      <NavbarGroup>
        <NavPartContent />
      </NavbarGroup>
      <NavbarGroup align="right">
        <UserPartContent />
      </NavbarGroup>
    </Navbar>
  )
}
