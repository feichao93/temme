import React from 'react'
import styled from 'styled-components'
import pkg from '../package.json'

Header.div = styled.header`
  background-color: #1d2a3f;
  color: white;
  display: flex;
`

export default function Header() {
  return (
    <Header.div>
      <p style={{ margin: 8 }}>
        Temme (v{pkg.version}) <span>is a concise selector to extract JSON from HTML.</span>
        <span style={{ marginLeft: 8 }}>
          <a href="https://github.com/shinima/temme" target="_blank">
            GitHub
          </a>
        </span>
        <span style={{ paddingLeft: 8 }}>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=shinima.vscode-temme"
            target="_blank"
          >
            VSCode Extension
          </a>
        </span>
        <span style={{ paddingLeft: 8 }}>
          <a id="browse-example-link" href="#">
            Examples
          </a>
        </span>
      </p>
      <div id="example-select-part" style={{ display: 'none', margin: '8px 8px 0' }}>
        <select id="example-select" title="Select an example" style={{ width: 350 }} />
        <button id="open-example-button" className="nav-button" style={{ background: '#0f9d61' }}>
          Open
        </button>
        <button id="prev-example-button" className="nav-button">
          Prev
        </button>
        <button id="next-example-button" className="nav-button">
          Next
        </button>
        <button id="exit-example-mode" className="nav-button" style={{ background: '#b93309' }}>
          Exit
        </button>
      </div>
    </Header.div>
  )
}
