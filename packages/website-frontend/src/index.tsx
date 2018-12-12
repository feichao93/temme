import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Router } from 'react-router'
import history from './utils/history'
import { SessionProvider } from './utils/session'
function render(Component: typeof App) {
  ReactDOM.render(
    //<DialogContextProvider>
    <SessionProvider>
      <Router history={history}>
        <Component />
      </Router>
    </SessionProvider>,
    // </DialogContextProvider>,
    document.querySelector('#app'),
  )
}

render(App)

declare global {
  interface NodeModule {
    hot: any
  }
  const CLIENT_ID: string
  const USER_ID: string
}

if (module.hot) {
  module.hot.accept() // self accept
  module.hot.accept('./App.tsx', () => {
    const { default: App } = require('./App.tsx')
    render(App)
  })
}
