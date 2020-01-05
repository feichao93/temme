import ReactDOM from 'react-dom'
import React from 'react'
import { App } from './App'

function render(Component: React.ComponentType) {
  ReactDOM.render(<Component />, document.getElementById('react-content'))
}

render(App)

declare global {
  interface NodeModule {
    hot: any
  }

  const ace: any
}
if (module.hot) {
  module.hot.accept('./App.tsx', () => {
    const NextApp = require('./App.tsx').default
    console.log({ NextApp })
    render(NextApp)
  })
  module.hot.accept()
}
