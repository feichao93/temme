import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Router } from 'react-router'
import history from './utils/history'
import { SessionProvider } from './utils/session'

function render(Component: typeof App) {
  ReactDOM.render(
    <SessionProvider>
      <Router history={history}>
        <Component />
      </Router>
    </SessionProvider>,
    document.querySelector('#app'),
  )
}

render(App)

declare global {
  interface NodeModule {
    hot: any
  }
}

if (module.hot) {
  module.hot.accept() // self accept
  module.hot.accept('./App.tsx', () => {
    const { default: App } = require('./App.tsx')
    render(App)
  })
}
