import React from 'react'
import Header from './Header'

export default function MainPage() {
  return (
    <>
      <Header />
      <div className="main-page">
        <div className="intro-text">
          <h1>temme 这是介绍文字</h1>
        </div>
        <div>{CLIENT_ID}</div>
        <div className="example">some example</div>
      </div>
    </>
  )
}
