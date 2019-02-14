import React from 'react'
import Header from './Header'
import './MainPage.styl'

export default function MainPage() {
  return (
    <div className="main-page">
      <Header />
      <main>
        <div className="intro-text">
          <h1>Temme</h1>
          <p>concise selector to extract JSON from HTML.</p>
        </div>
      </main>
      <footer>
        Code with ❤️ by{' '}
        <a href="https://github.com/shinima" target="_blank">
          @shinima
        </a>
      </footer>
    </div>
  )
}
