import { Dispatch, SetStateAction, useState } from 'react'
import React from 'react'
import { useDialog } from './dialog'
import { DialogContainer } from './DialogContainer'
import { addProject, updateProject } from '../utils/server'

interface ProjectDialogProps {
  projectId: number
  name: string
  description: string
  username: string
  fetchUserProjects: (username: string) => Promise<void>
}
export function ProjectDialogContent(props: ProjectDialogProps) {
  const [nameState, setNameState] = useState(props.name)
  const [descState, setDescState] = useState(props.description)
  const { closeDialog } = useDialog()
  const onInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    cb: Dispatch<SetStateAction<string>>,
  ) => {
    cb(event.target.value)
  }
  const onConfirm = async () => {
    const { fetchUserProjects, projectId, username } = props
    // todo 根据projectId 发送请求
    try {
      if (projectId === -1) {
        await addProject(nameState, descState)
      } else {
        await updateProject(projectId, nameState, descState)
      }
      await fetchUserProjects(username)
    } catch (e) {
      alert(projectId === -1 ? '创建失败項目' : '更新項目失败')
    }
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
export const ProjectDialog = (props: ProjectDialogProps) => (
  <DialogContainer>
    <ProjectDialogContent {...props} />
  </DialogContainer>
)
