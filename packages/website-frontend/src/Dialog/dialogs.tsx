import invariant from 'invariant'
import React, { createContext, useContext, useRef, useState } from 'react'
import { DialogContainer } from './DialogContainer'
import './dialog.styl'

// TODO 精简代码

interface Content {
  title?: string
  message: string
  initValue?: string
}

type EmptyDialogState = { type: 'empty' }
type PromptDialogState = { type: 'prompt'; title: string; message: string; initValue: string }
type ConfirmDialogState = { type: 'confirm'; title: string; message: string }
type AlertDialogState = { type: 'alert'; title: string; message: string }
type TernaryDialogState = { type: 'ternary'; title: string; message: string }

type DialogState =
  | EmptyDialogState
  | PromptDialogState
  | ConfirmDialogState
  | AlertDialogState
  | TernaryDialogState

type TernaryOption = 'yes' | 'no' | 'cancel'

interface DialogContextType {
  confirm(content: Content): Promise<boolean>
  prompt(content: Content): Promise<string>
  alert(content: Content): Promise<void>
  ternary(content: Content): Promise<TernaryOption>
}

type Callback = (arg?: any) => void

const DialogContext = createContext<DialogContextType>(null)

export function DialogContextProvider({ children }: { children?: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ type: 'empty' })
  const cbRef = useRef<Callback>(null)

  function prompt({ title, message, initValue = '' }: Content) {
    invariant(cbRef.current == null, 'Cannot create multiple dialog at the same time.')
    setState({ type: 'prompt', title, message, initValue })
    return new Promise<string>(resolve => {
      cbRef.current = result => {
        cbRef.current = null
        setState({ type: 'empty' })
        resolve(result)
      }
    })
  }

  function confirm({ title, message }: Content) {
    invariant(cbRef.current == null, 'Cannot create multiple dialog at the same time.')
    setState({ type: 'confirm', title, message })
    return new Promise<boolean>(resolve => {
      cbRef.current = result => {
        cbRef.current = null
        setState({ type: 'empty' })
        resolve(result)
      }
    })
  }

  function alert({ title, message }: Content) {
    invariant(cbRef.current == null, 'Cannot create multiple dialog at the same time.')
    setState({ type: 'alert', title, message })
    return new Promise<void>(resolve => {
      cbRef.current = () => {
        cbRef.current = null
        setState({ type: 'empty' })
        resolve()
      }
    })
  }

  function ternary({ title, message }: Content) {
    invariant(cbRef.current == null, 'Cannot create multiple dialog at the same time.')
    setState({ type: 'ternary', title, message })
    return new Promise<TernaryOption>(resolve => {
      cbRef.current = result => {
        cbRef.current = null
        setState({ type: 'empty' })
        resolve(result)
      }
    })
  }

  return (
    <DialogContext.Provider value={{ confirm, prompt, alert, ternary }}>
      {children}
      <DialogContainer show={state.type !== 'empty'} canOutsideClickClose={false}>
        {state.type === 'confirm' && <ConfirmDialogContent message={state.message} cbRef={cbRef} />}
        {state.type === 'prompt' && (
          <PromptDialogContent
            title={state.title}
            message={state.message}
            cbRef={cbRef}
            initValue={state.initValue}
          />
        )}
        {state.type === 'alert' && (
          <AlertDialogContent title={state.title} message={state.message} cbRef={cbRef} />
        )}
        {state.type === 'ternary' && (
          <TernaryDialogContent title={state.title} message={state.message} cbRef={cbRef} />
        )}
      </DialogContainer>
    </DialogContext.Provider>
  )
}

export function useDialogs() {
  return useContext(DialogContext)
}

function ConfirmDialogContent({
  message,
  cbRef,
}: {
  message: string
  cbRef: React.RefObject<Callback>
}) {
  return (
    <div className="confirm-dialog">
      <div className="message">{message}</div>
      <div className="dialog-buttons">
        <button onClick={() => cbRef.current(true)} className="dialog-button confirm">
          确认
        </button>
        <button onClick={() => cbRef.current(false)} className="dialog-button cancel">
          取消
        </button>
      </div>
    </div>
  )
}

function autoSelect(node: HTMLInputElement) {
  if (node != null) {
    node.select()
  }
}

function PromptDialogContent({
  title,
  message,
  cbRef,
  initValue,
}: {
  title: string
  message: string
  initValue: string
  cbRef: React.RefObject<Callback>
}) {
  const [value, setValue] = useState(initValue)
  function onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      cbRef.current(value)
    }
  }
  return (
    <div className="prompt-dialog">
      <div className="message">{message}</div>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        ref={autoSelect}
        onKeyPress={onKeyPress}
      />
      <div className="dialog-buttons">
        <button onClick={() => cbRef.current(value)} className="dialog-button confirm">
          确认
        </button>
        <button onClick={() => cbRef.current(null)} className="dialog-button cancel">
          取消
        </button>
      </div>
    </div>
  )
}

function AlertDialogContent({
  title,
  message,
  cbRef,
}: {
  title: string
  message: string
  cbRef: React.RefObject<Callback>
}) {
  return (
    <div className="prompt-dialog">
      <h1>{title}</h1>
      <div className="message">{message}</div>
      <div className="dialog-buttons">
        <button onClick={() => cbRef.current()} className="dialog-button confirm">
          确认
        </button>
      </div>
    </div>
  )
}

function TernaryDialogContent({
  title,
  message,
  cbRef,
}: {
  title: string
  message: string
  cbRef: React.RefObject<Callback>
}) {
  return (
    <div className="confirm-dialog">
      <div className="message">{message}</div>
      <div className="dialog-buttons">
        <button onClick={() => cbRef.current('yes')} className="dialog-button confirm">
          保存
        </button>
        <button onClick={() => cbRef.current('no')} className="dialog-button cancel">
          不保存
        </button>
        <button onClick={() => cbRef.current('cancel')} className="dialog-button cancel">
          取消
        </button>
      </div>
    </div>
  )
}
