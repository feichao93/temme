import { createContext, useContext, useState } from 'react'
import React from 'react'

interface DialogContext {
  show: boolean
  openDialog: () => void
  closeDialog: () => void
}
const DialogContext = createContext({} as DialogContext)

export function DialogProvider({ children }: { children: JSX.Element }) {
  const [showState, setShowState] = useState(true)
  function openDialog() {
    setShowState(true)
  }
  function closeDialog() {
    setShowState(false)
  }
  return (
    <DialogContext.Provider value={{ show: showState, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  )
}

export const useDialog = () => useContext(DialogContext)
