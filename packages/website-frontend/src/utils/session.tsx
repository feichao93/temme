import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDialogs } from '../dialogs'
import toaster from '../toaster'
import * as server from './server'

interface SessionContext {
  username: string
  userId: number
  connected: boolean
  login: () => void
  logout: () => void
}
interface Session {
  username: string
  userId: number
  connected: boolean
}
const defaultSession: Session = {
  username: null,
  userId: -1,
  connected: false,
}
const SessionContext = createContext(null as SessionContext)

export function SessionProvider({ children }: { children: JSX.Element }) {
  const [sessionState, setSessionState] = useState(defaultSession)
  const dialogs = useDialogs()

  function login() {
    window.open(`/oauth-request`, '_blank', 'width=965,height=560,top=250,left=150')
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

  async function fetchLoginInfo() {
    try {
      const { username, userId } = await server.getMyInfo()
      setSessionState({ ...sessionState, username, userId, connected: true })
    } catch (e) {
      console.error(e)
      dialogs.alert({
        title: '请求失败',
        message: '获取当前登录信息失败，请刷新后重试。',
      })
    }
  }

  useEffect(() => {
    fetchLoginInfo()
  }, [])

  useEffect(() => {
    function onReceiveMessage(event: MessageEvent) {
      if (event.data.userId && event.data.username) {
        const { username, userId }: Session = event.data
        setSessionState(state => ({ ...state, username, userId }))
      }
    }

    window.addEventListener('message', onReceiveMessage, false)
    return () => {
      window.removeEventListener('message', onReceiveMessage)
    }
  }, [])

  return (
    <SessionContext.Provider value={{ ...sessionState, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}
export const useSession = () => useContext(SessionContext)
