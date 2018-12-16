import { Dispatch, SetStateAction, useState } from 'react'
import React from 'react'
import { useDialog } from './dialog'
import { DialogContainer } from './DialogContainer'

export function ProjectDialogContent(props: any) {
  const [nameState, setNameState] = useState('')
  const [descState, setDescState] = useState('')
  const { closeDialog } = useDialog()
  const onInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    cb: Dispatch<SetStateAction<string>>,
  ) => {
    cb(event.target.value)
  }
  const onConfirm = () => {
    // todo 根据projectId 发送请求
    closeDialog()
  }
  const onCancel = () => {
    closeDialog()
  }
  return (
    <div className="project-dialog">
      <div className="title">Create Project</div>
      <div className="name">project name</div>
      <input onChange={event => onInputChange(event, setNameState)} value={nameState} />
      <div className="name">description</div>
      <input onChange={event => onInputChange(event, setDescState)} value={descState} />
      <div className="dialog-buttons">
        <button className="button success" onClick={onConfirm}>
          confirm
        </button>
        <button className="button error" onClick={onCancel}>
          cancel
        </button>
      </div>
    </div>
  )
}
export const ProjectDialog = () => (
  <DialogContainer>
    <ProjectDialogContent />
  </DialogContainer>
)
