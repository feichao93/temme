import React, { createContext, useContext, useEffect, useState } from 'react'
import toaster from '../toaster'
import * as server from './server'

interface SessionState {
  /** 当前登录用户的用户名；未登录状态下该字段为 `null` */
  username: string
  /** 当前登录用户的 id；未登录状态下该字段为 `-1` */
  userId: number
  /** 是否获取到 getMyInfo 接口返回的信息 */
  connected: boolean
  /** 是否正在进行登录 */
  loggingIn: boolean
  /** 当前用户是否为管理员 */
  isAdmin: boolean
}

type SessionContextType = SessionState & {
  login: () => void
  logout: () => void
}

const defaultSession: SessionState = {
  username: null,
  userId: -1,
  connected: false,
  loggingIn: false,
  isAdmin: false,
}
const SessionContext = createContext(null as SessionContextType)

export function SessionProvider({ children }: { children: JSX.Element }) {
  const [sessionState, setSessionState] = useState(defaultSession)

  function login() {
    setSessionState({ ...sessionState, loggingIn: true })
    window.open(`/oauth-request`, '_blank', 'width=965,height=560,top=250,left=150')
    // TODO 设置超时时间
  }

  function logout() {
    setSessionState({
      ...sessionState,
      userId: -1,
      username: null,
    })
    server.logout().then(() => {
      toaster.show({ icon: 'log-out', message: '已登出' })
    })
  }

  useEffect(() => {
    server
      .getMyInfo()
      .then(myInfo => setSessionState({ ...sessionState, ...myInfo, connected: true }))
      .catch(e => {
        console.error(e)
        toaster.show({
          icon: 'error',
          intent: 'danger',
          message: '获取当前登录信息失败，请刷新后重试。',
        })
      })
  }, [])

  useEffect(() => {
    if (sessionState.loggingIn) {
      function onReceiveMessage(event: MessageEvent) {
        if (event.data && event.data.userId && event.data.username) {
          setSessionState(state => ({ ...state, ...event.data, loggingIn: false }))
        }
      }

      window.addEventListener('message', onReceiveMessage, false)
      return () => {
        window.removeEventListener('message', onReceiveMessage)
      }
    }
  }, [sessionState.loggingIn])

  return (
    <SessionContext.Provider value={{ ...sessionState, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}
export const useSession = () => useContext(SessionContext)
