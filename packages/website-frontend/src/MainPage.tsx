import React from 'react'
import Header from './Header'
import './MainPage.styl'

export default function MainPage() {
  return (
    <div className="main-page">
      <Header />
      <main>
        <div className="intro-text">
          <h1>创建、运行、分享 temme 选择器</h1>
          <p>temme 是一个类 jQuery 的选择器，用于简洁优雅地从 HTML 文档中提取所需的 JSON 数据。</p>
        </div>
      </main>
      <footer>
        Code with ❤️by{' '}
        <a href="https://github.com/shinima" target="_blank">
          @shinima
        </a>
      </footer>
    </div>
  )
}
