import { Button, ButtonGroup, Tooltip } from '@blueprintjs/core'
import React, { useEffect, useState } from 'react'
import { Link, match } from 'react-router-dom'
import { useDialogs } from './dialogs'
import Header from './Header'
import { EmailIcon, GithubIcon, LocationIcon } from './icons'
import { EditProjectDialog, NewProjectDialog } from './ProjectDialog'
import toaster from './toaster'
import { Project, UserInfo } from './types'
import './UserPage.styl'
import { fromNow } from './utils/common'
import * as server from './utils/server'
import { useSession } from './utils/session'

interface Params {
  login: string
}

interface DialogState {
  isOpen: boolean
  isNewProject?: boolean
  projectId?: string
}

export default function UserPage({ match }: { match: match<Params> }) {
  const login = match.params.login
  const dialogs = useDialogs()
  const { username } = useSession()

  const [userInfo, setUserInfo] = useState<UserInfo>(null)
  const [projectList, setProjectList] = useState<Project[]>(null)
  const [is404, set404] = useState(false)
  useEffect(() => set404(false), [login])

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    isNewProject: false,
    projectId: null,
  })

  const editingProject =
    dialogState.isOpen && !dialogState.isNewProject
      ? projectList.find(p => p._id === dialogState.projectId)
      : null

  useEffect(() => {
    if (login) {
      fetchUserInfo(login)
    }
  }, [login])

  if (is404) {
    return (
      <div className="user-page">
        <Header />
        <main>
          <img src={require('../imgs/404.jpg')} alt="404" />
        </main>
      </div>
    )
  }

  if (userInfo == null || projectList == null) {
    return (
      <div className="user-page">
        <Header />
      </div>
    )
  }

  return (
    <div className="user-page">
      <NewProjectDialog
        isOpen={dialogState.isOpen && dialogState.isNewProject}
        onRequestAddProject={onRequestAddProject}
        onClose={() => setDialogState({ isOpen: false })}
      />
      <EditProjectDialog
        isOpen={Boolean(editingProject)}
        onClose={() => setDialogState({ isOpen: false })}
        onRequestEditProject={onRequestEditProject}
        initName={editingProject && editingProject.name}
        initDescription={editingProject && editingProject.description}
      />
      <Header />
      <main>
        <div className="user-profile">
          <img className="avatar mb16" src={userInfo.avatar_url} alt="avatar-icon" />
          <div className="fullname">{userInfo.name}</div>
          <div className="username mb16">{login}</div>
          <div className="bio mb16">{userInfo.bio}</div>
          <div className="location">
            <LocationIcon />
            {userInfo.location}
          </div>
          <a className="email" href={`mailto:${userInfo.email}`}>
            <EmailIcon />
            {userInfo.email}
          </a>
          <div className="divider" />
          <a href={userInfo.html_url} target="_blank">
            <GithubIcon size={30} />
          </a>
        </div>

        <div className="user-project">
          <div className="tab-bar">
            <div className="tab">
              项目
              <span className="count">{projectList.length}</span>
            </div>
            {username === login && (
              <ButtonGroup style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                <Tooltip content="从 zip 文件中导入项目">
                  <Button icon="import" text="导入" onClick={onRequestImportProject} />
                </Tooltip>
                <Button
                  icon="cube-add"
                  text="新建"
                  onClick={() => setDialogState({ isOpen: true, isNewProject: true })}
                />
              </ButtonGroup>
            )}
          </div>
          <div className="project-list">
            {projectList &&
              projectList.map(project => (
                <div key={project._id} className="project-item">
                  <Link className="project-name" to={`/@${login}/${project.name}`}>
                    {project.name}
                  </Link>
                  <div className="project-description">{project.description}</div>
                  <div className="project-update">{fromNow(project.updatedAt)}前更新</div>
                  {username === login && (
                    <div className="manage-project">
                      <ButtonGroup>
                        <Button
                          minimal
                          intent="primary"
                          icon="edit"
                          onClick={() =>
                            setDialogState({
                              isOpen: true,
                              isNewProject: false,
                              projectId: project._id,
                            })
                          }
                        />
                        <Button
                          minimal
                          intent="danger"
                          icon="trash"
                          onClick={() => handleDeleteProject(project._id)}
                        />
                      </ButtonGroup>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  )

  function fetchUserInfo(username: string) {
    server
      .getUserInfo(username)
      .then(({ userInfo, projectList }) => {
        setUserInfo(userInfo)
        setProjectList(projectList)
      })
      .catch(e => {
        console.error(e)
        if (e.status === 404) {
          set404(true)
          return
        }
        toaster.show({ intent: 'warning', message: '加载用户信息失败' })
      })
  }

  async function handleDeleteProject(projectId: string) {
    const project = projectList.find(p => p._id === projectId)
    const confirmed = await dialogs.confirm({
      title: '确认删除',
      message: (
        <span>
          是否删除项目 <b style={{ color: '#b13b00' }}>{project.name}</b> ？
        </span>
      ),
      confirmIntent: 'danger',
    })
    if (!confirmed) {
      return
    }
    try {
      await server.deleteProject(projectId)
      toaster.show({
        intent: 'primary',
        message: (
          <span>
            已删除 <b>{project.name}</b>
          </span>
        ),
      })
      const nextProjectList = projectList.filter(p => p._id !== projectId)
      setProjectList(nextProjectList)
    } catch (e) {
      console.error(e)
      toaster.show({ intent: 'danger', message: '删除失败' })
    }
  }

  function onRequestImportProject() {
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    input.onchange = () => {
      const file = input.files[0]
      if (file.type !== 'application/x-zip-compressed') {
        toaster.show({ icon: 'error', intent: 'warning', message: '请上传 .zip 文件' })
        return
      }
      const zipFile = input.files[0]
      server
        .createProjectByZip(zipFile)
        .then(({ project, warnings }) => {
          setProjectList(list => list.concat(project))

          const message = (
            <>
              <span>已导入 {project.name}</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>
                {'\n' + warnings.map(w => `\n${w}`).join('')}
              </span>
            </>
          )
          toaster.show({ intent: 'primary', message })
        })
        .catch(async err => {
          toaster.show({
            intent: 'danger',
            message: `${err.response.status} ${err.response.text()}`,
          })
        })
    }
  }

  async function onRequestAddProject(name: string, description: string) {
    try {
      const newProject = await server.addProject(name, description)
      setDialogState({ isOpen: false })
      setProjectList(projectList.concat([newProject]))
      toaster.show({ message: `已创建 ${name}` })
    } catch (e) {
      console.error(e)
      toaster.show({ intent: 'danger', message: '创建失败' })
    }
  }

  async function onRequestEditProject(name: string, description: string) {
    try {
      await server.updateProjectMeta(dialogState.projectId, name, description)
      setDialogState({ isOpen: false })
      const nextProjectList = projectList.map(p =>
        p._id === dialogState.projectId ? { ...p, name, description } : p,
      )
      setProjectList(nextProjectList)
      toaster.show({ intent: 'success', message: '已修改' })
    } catch (e) {
      console.error(e)
      toaster.show({ intent: 'danger', message: '修改失败' })
    }
  }
}
