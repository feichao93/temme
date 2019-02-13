import { Dispatch, SetStateAction, useState } from 'react'
import React from 'react'
import { DialogContainer } from './DialogContainer'
import * as server from '../utils/server'

interface ProjectDialogProps {
  show: boolean
  onClose(): void
  projectId: number
  name: string
  description: string
  username: string
  fetchUserProjects: (username: string) => Promise<void>
}

export default function ProjectDialog(props: ProjectDialogProps) {
  const { show, onClose, projectId, name, description, username, fetchUserProjects } = props

  const [nameState, setNameState] = useState(name)
  const [descState, setDescState] = useState(description)

  const onInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    cb: Dispatch<SetStateAction<string>>,
  ) => {
    cb(event.target.value)
  }

  const onConfirm = async () => {
    try {
      if (projectId === -1) {
        await server.addProject(nameState, descState)
      } else {
        await server.updateProject(projectId, nameState, descState)
      }
      await fetchUserProjects(username)
    } catch (e) {
      alert(projectId === -1 ? '创建失败項目' : '更新項目失败')
    }
    onClose()
  }

  return (
    <DialogContainer show={show} onClose={onClose}>
      <div className="project-dialog">
        <div className="title">Create Project</div>
        <div className="name">project name</div>
        <input onChange={event => onInputChange(event, setNameState)} value={nameState} />
        <div className="name">description</div>
        <input onChange={event => onInputChange(event, setDescState)} value={descState} />
        <div className="dialog-buttons">
          <button className="dialog-button success" onClick={onConfirm}>
            confirm
          </button>
          <button className="dialog-button error" onClick={onClose}>
            cancel
          </button>
        </div>
      </div>
    </DialogContainer>
  )
}
