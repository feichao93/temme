import { Button, Classes, Dialog, FormGroup, IconName, InputGroup, Intent } from '@blueprintjs/core'
import { noop } from 'little-saga'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import useInput from './utils/common'

interface DialogProps {
  icon?: IconName
  title?: string
  message?: React.ReactNode
  confirmIntent?: Intent
  onConfirm?: () => void
  onCancel?: () => void
  onSubmit?: (val: string) => void
  initValue?: string
}

interface DialogState {
  type: string
  icon?: IconName
  title?: string
  message?: React.ReactNode
  confirmIntent?: Intent
  initValue?: string
}

export interface DialogContextType {
  confirm(props: DialogProps): Promise<boolean>
  prompt(props: DialogProps): Promise<string | null>
  alert(props: DialogProps): Promise<void>
}

const DialogContext = createContext<DialogContextType>(null)

export function DialogContextProvider({ children }: { children: JSX.Element }) {
  const [state, setState] = useState<DialogState>({ type: 'empty' })
  const callback = useRef(noop as any)

  return (
    <DialogContext.Provider value={{ confirm, prompt, alert }}>
      {children}
      <Dialog
        icon={state.type !== 'empty' ? state.icon : null}
        title={state.type !== 'empty' && state.title}
        isOpen={state.type !== 'empty'}
        style={{ width: 600 }}
        isCloseButtonShown={false}
      >
        {state.type === 'confirm' && (
          <ConfirmDialogContent
            message={state.message}
            confirmIntent={state.confirmIntent}
            onConfirm={() => callback.current(true)}
            onCancel={() => callback.current(false)}
          />
        )}
        {state.type === 'prompt' && (
          <PromptDialogContent
            message={state.message}
            initValue={state.initValue}
            confirmIntent={state.confirmIntent}
            onSubmit={(val: string) => callback.current(val)}
          />
        )}
        {state.type === 'alert' && (
          <AlertDialogContent
            message={state.message}
            confirmIntent={state.confirmIntent}
            onConfirm={() => callback.current()}
          />
        )}
      </Dialog>
    </DialogContext.Provider>
  )

  function prompt({
    icon = 'manually-entered-data',
    title,
    message,
    confirmIntent = 'success',
    initValue = '',
  }: DialogProps): Promise<string | null> {
    setState({ type: 'prompt', icon, title, message, confirmIntent, initValue })
    return new Promise(resolve => {
      callback.current = (result: string) => {
        callback.current = null
        setState({ type: 'empty' })
        resolve(result)
      }
    })
  }

  function confirm({
    icon = 'help',
    title,
    message,
    confirmIntent,
  }: DialogProps): Promise<boolean> {
    setState({ type: 'confirm', icon, title, message, confirmIntent })
    return new Promise(resolve => {
      callback.current = (result: boolean) => {
        callback.current = null
        setState({ type: 'empty' })
        resolve(result)
      }
    })
  }

  function alert({
    icon = 'info-sign',
    title,
    message,
    confirmIntent,
  }: DialogProps): Promise<void> {
    setState({ type: 'alert', icon, title, message, confirmIntent })
    return new Promise(resolve => {
      callback.current = () => {
        callback.current = null
        setState({ type: 'empty' })
        resolve()
      }
    })
  }
}

export function useDialogs() {
  return useContext(DialogContext)
}

function ConfirmDialogContent({ message, onConfirm, onCancel, confirmIntent }: DialogProps) {
  return (
    <>
      <div className={Classes.DIALOG_BODY}>{message}</div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent={confirmIntent} onClick={onConfirm}>
            确认
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    </>
  )
}

function PromptDialogContent({ message, onSubmit, confirmIntent, initValue }: DialogProps) {
  const promptInput = useInput(initValue)
  const inputRef: any = useRef(null)
  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.select()
    }
  }, [])

  return (
    <>
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label={message}>
          <InputGroup inputRef={inputRef} {...promptInput.props} />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent={confirmIntent} onClick={() => onSubmit(promptInput.value)} text="确认" />
          <Button onClick={() => onSubmit(null)}>取消</Button>
        </div>
      </div>
    </>
  )
}

function AlertDialogContent({ message, confirmIntent, onConfirm }: DialogProps) {
  return (
    <>
      <div className={Classes.DIALOG_BODY}>{message}</div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent={confirmIntent} onClick={onConfirm}>
            确认
          </Button>
        </div>
      </div>
    </>
  )
}
