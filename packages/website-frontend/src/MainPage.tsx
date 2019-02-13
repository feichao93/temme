import React from 'react'
import Header from './Header'

export default function MainPage() {
  return (
    <>
      <Header />
      <div className="main-page">
        <div className="intro-text">
          <h1>Temme</h1>
          <p>Temme is a concise selector to extract JSON from HTML.</p>
        </div>
        <div className="example">
          Code with ❤️ by{' '}
          <a href="https://github.com/shinima" target="_blank" style={{ color: 'white' }}>
            @shinima
          </a>
        </div>
      </div>
    </>
  )
}
