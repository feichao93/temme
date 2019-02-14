import { Button, ButtonGroup } from '@blueprintjs/core'
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
  projectId?: number
}

export default function UserPage({ match }: { match: match<Params> }) {
  const login = match.params.login
  const dialogs = useDialogs()
  const { username } = useSession()

  const [userInfo, setUserInfo] = useState<UserInfo>(null)
  const [projectList, setProjectList] = useState<Project[]>(null)

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    isNewProject: false,
    projectId: -1,
  })

  const editingProject =
    dialogState.isOpen && !dialogState.isNewProject
      ? projectList.find(p => p.projectId === dialogState.projectId)
      : null

  useEffect(() => {
    if (login) {
      fetchUserInfo(login)
      fetchUserProjects(login)
    }
  }, [login])

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
              <Button
                icon="cube-add"
                text="新建"
                onClick={() => setDialogState({ isOpen: true, isNewProject: true })}
                style={{ marginLeft: 'auto', alignSelf: 'center' }}
              />
            )}
          </div>
          <div className="project-list">
            {projectList &&
              projectList.map(project => (
                <div key={project.projectId} className="project-item">
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
                              projectId: project.projectId,
                            })
                          }
                        />
                        <Button
                          minimal
                          intent="danger"
                          icon="trash"
                          onClick={() => handleDeleteProject(project.projectId)}
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
      .then(userInfo => {
        setUserInfo({ ...userInfo, ...userInfo })
      })
      .catch(e => {
        console.error(e)
      })
  }

  async function fetchUserProjects(username: string) {
    try {
      const projects = await server.getUserProjects(username)
      setProjectList(projects)
    } catch (e) {
      toaster.show({ intent: 'warning', message: '加载用户项目列表失败' })
      console.error(e)
    }
  }

  async function handleDeleteProject(projectId: number) {
    const project = projectList.find(p => p.projectId === projectId)
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
            已删除 <b style={{ color: '#b13b00' }}>{project.name}</b>
          </span>
        ),
      })
      const nextProjectList = projectList.filter(p => p.projectId !== projectId)
      setProjectList(nextProjectList)
    } catch (e) {
      console.error(e)
      toaster.show({ intent: 'danger', message: '删除失败' })
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
        p.projectId === dialogState.projectId ? { ...p, name, description } : p,
      )
      setProjectList(nextProjectList)
      toaster.show({ message: `修改成功` })
    } catch (e) {
      console.error(e)
      toaster.show({ intent: 'danger', message: '修改失败' })
    }
  }
}
