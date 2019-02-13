import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router'
import App from './App'
import { DialogContextProvider } from './dialogs'
import history from './utils/history'
import { SessionProvider } from './utils/session'

function render(Component: typeof App) {
  ReactDOM.render(
    <DialogContextProvider>
      <SessionProvider>
        <Router history={history}>
          <Component />
        </Router>
      </SessionProvider>
    </DialogContextProvider>,
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
