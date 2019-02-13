import { Button, Classes, Dialog, FormGroup, InputGroup, TextArea } from '@blueprintjs/core'
import React from 'react'
import useInput from './utils/common'
import * as server from './utils/server'

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

  const nameInput = useInput(name)
  const descInput = useInput(description)

  const onConfirm = async () => {
    try {
      if (projectId === -1) {
        await server.addProject(nameInput.value, descInput.value)
      } else {
        await server.updateProject(projectId, nameInput.value, descInput.value)
      }
      await fetchUserProjects(username)
    } catch (e) {
      alert(projectId === -1 ? '创建失败項目' : '更新項目失败')
    }
    onClose()
  }

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      title="Create Project"
      icon="cube-add"
      style={{ width: 600 }}
      canOutsideClickClose={false}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="Project Name" labelFor="project-name-input" labelInfo="(required)">
          <InputGroup id="project-name-input" {...nameInput.props} />
        </FormGroup>
        <FormGroup label="Project Description" labelFor="project-description-input">
          <TextArea fill {...descInput.props} />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent="success" onClick={onConfirm}>
            Confirm
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Dialog>
  )
}
