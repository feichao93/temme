import { Button, Classes, Dialog, FormGroup, InputGroup, TextArea } from '@blueprintjs/core'
import React, { useEffect } from 'react'
import useInput from './utils/common'

export interface NewProjectDialogProps {
  isOpen: boolean
  onRequestAddProject(name: string, description: string): void
  onClose(): void
}
export function NewProjectDialog({ isOpen, onClose, onRequestAddProject }: NewProjectDialogProps) {
  const nameInput = useInput('')
  const descInput = useInput('')

  useEffect(() => {
    if (isOpen) {
      nameInput.setValue('')
      descInput.setValue('')
    }
  }, [isOpen])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="创建新的项目"
      icon="cube-add"
      style={{ width: 600 }}
      canOutsideClickClose={false}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="项目名称" labelFor="project-name-input" labelInfo="(必填项)">
          <InputGroup id="project-name-input" {...nameInput.props} />
        </FormGroup>
        <FormGroup
          label="项目描述"
          labelInfo="(markdown 已启用)"
          labelFor="project-description-input"
        >
          <TextArea style={{ resize: 'none', height: 150 }} fill {...descInput.props} />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            intent="success"
            onClick={() => onRequestAddProject(nameInput.value, descInput.value)}
          >
            创建
          </Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      </div>
    </Dialog>
  )
}

export interface EditProjectDialogProps {
  isOpen: boolean
  onClose(): void
  onRequestEditProject(name: string, description: string): void
  initName: string
  initDescription: string
}
export function EditProjectDialog({
  isOpen,
  onClose,
  onRequestEditProject,
  initName,
  initDescription,
}: EditProjectDialogProps) {
  const nameInput = useInput(initName)
  const descInput = useInput(initDescription)

  useEffect(() => {
    if (isOpen) {
      nameInput.setValue(initName)
      descInput.setValue(initDescription)
    }
  }, [isOpen])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="编辑项目"
      icon="cube"
      style={{ width: 600 }}
      canOutsideClickClose={false}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="项目名称" labelFor="project-name-input" labelInfo="(必填项)">
          <InputGroup id="project-name-input" {...nameInput.props} />
        </FormGroup>
        <FormGroup
          label="项目描述"
          labelInfo="(markdown 已启用)"
          labelFor="project-description-input"
        >
          <TextArea fill style={{ resize: 'none', height: 150 }} {...descInput.props} />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            intent="success"
            onClick={() => onRequestEditProject(nameInput.value, descInput.value)}
          >
            确认
          </Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      </div>
    </Dialog>
  )
}
