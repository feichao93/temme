import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
h2 {
  margin: 8px 0;
  font-size: 16px;
  color: #374a68;
}

a:visited {
  color: inherit;
}

.d-flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-align-center {
  align-items: center;
}

.flex-space-between {
  justify-content: space-between;
}

.flex-grow-1 {
  flex-grow: 1;
}

.hint {
  font-weight: normal;
  font-size: 16px;
  padding-left: 8px;
}

.transition-width {
  transition: width 300ms;
}

.nav-button {
  border: none;
  width: 64px;
  height: 24px;
  color: aliceblue;
  background: #5587d3;
}

#error-indicator {
  color: #dc3545;
}

#copy-result-button {
  width: 36px;
  height: 28px;
  color: #24292e;
  background: #eff3f6 linear-gradient(-180deg, #fafbfc 0%, #eff3f6 90%);
  cursor: pointer;
  border-radius: 2px;
  border: 1px rgba(27, 31, 35, 0.35) solid;
}

#copy-result-button:hover {
  background: #e6ebf1 linear-gradient(-180deg, #f0f3f6 0%, #e6ebf1 90%);
  border-color: rgba(27, 31, 35, 0.35);
}

#copy-result-button:active {
  outline: none;
  background: #e9ecef none;
  border-color: rgba(27, 31, 35, 0.35);
  box-shadow: inset 0 0.15em 0.3em rgba(27, 31, 35, 0.15);
}

#toggle-width-button {
  width: 50px;
  font-weight: bold;
}

.flat-button {
  height: 24px;
  border: none;
  background: #374a68;
  color: white;
  outline: none;
  cursor: pointer;
}

.editor {
  flex: 1;
  position: relative;
  border-top: 1px solid #eeeeee;
  border-bottom: 1px solid #eeeeee;
  font-size: 16px;
  font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, 'Microsoft YaHei',
    monospace;
}

.syntax-error {
  position: absolute;
  border-bottom: 1px solid red;
}
`

export default GlobalStyle
