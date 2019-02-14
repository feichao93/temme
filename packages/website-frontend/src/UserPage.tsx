import { Button, ButtonGroup } from '@blueprintjs/core'
import React, { useEffect, useState } from 'react'
import { Link, match } from 'react-router-dom'
import Header from './Header'
import { GithubIcon, LocationIcon } from './icons'
import ProjectDialog from './ProjectDialog'
import { Project, UserInfo } from './types'
import './UserPage.styl'
import { fromNow } from './utils/common'
import { deleteProject, getDetailInfo, getUserProjects } from './utils/server'
import { useSession } from './utils/session'

interface Params {
  login: string
}

export default function UserPage({ match }: { match: match<Params> }) {
  return (
    <div className="user-page">
      <Header />
      <main>
        <UserProfile login={match.params.login} />
        <UserProjects login={match.params.login} />
      </main>
    </div>
  )
}

function UserProfile({ login }: { login: string }) {
  const [userInfoState, setUserInfoState] = useState(null as UserInfo)
  const fetchUserInfo = async (username: string) => {
    try {
      const userInfo = await getDetailInfo(username)
      setUserInfoState({ ...userInfoState, ...userInfo })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (login) {
      fetchUserInfo(login)
    }
  }, [login])

  return (
    userInfoState && (
      <div className="user-profile">
        <img className="avatar mb16" src={userInfoState.avatar_url} alt="avatar-icon" />
        <div className="fullname">{userInfoState.name}</div>
        <div className="username mb16">{login}</div>
        <div className="bio mb16">{userInfoState.bio}</div>
        <div className="location">
          <LocationIcon />
          {userInfoState.location}
        </div>
        <a className="email" href={`mailto:${userInfoState.email}`}>
          <svg viewBox="0 0 14 16" width="22" height="16">
            <path
              d="M0 4v8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1zm13 0L7 9 1 4h12zM1 5.5l4 3-4 3v-6zM2 12l3.5-3L7 10.5 8.5 9l3.5 3H2zm11-.5l-4-3 4-3v6z"
              fill="#6a737d"
            />
          </svg>
          {userInfoState.email}
        </a>
        <div className="divider" />
        <a href={userInfoState.html_url} target="_blank">
          <GithubIcon size={30} />
        </a>
      </div>
    )
  )
}

function UserProjects({ login }: { login: string }) {
  const { username } = useSession()
  const [projectsState, setProjectsState] = useState([] as Project[])
  const [selectedProjectState, setSelectedProjectState] = useState({
    name: '',
    projectId: -1,
    description: '',
  })
  const [show, setShow] = useState(false)
  const onOpen = () => setShow(true)
  const onClose = () => setShow(false)

  const fetchUserProjects = async (username: string) => {
    try {
      const projects = await getUserProjects(username)
      setProjectsState([...projects])
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    if (login) {
      fetchUserProjects(login)
    }
  }, [login])

  const createProject = () => {
    setSelectedProjectState({ name: '', projectId: -1, description: '' })
    onOpen()
  }

  const handleDeleteProject = async (projectId: number, name: string) => {
    if (confirm(`是否删除项目${name}`)) {
      try {
        await deleteProject(projectId)
        alert('删除成功')
        fetchUserProjects(login)
      } catch (e) {
        alert('删除失败，请稍后再试')
      }
    }
  }

  const handleEditProject = (project: Project) => {
    const { name, description, projectId } = project
    setSelectedProjectState({ name, description, projectId })
    onOpen()
  }

  return (
    <div className="user-project">
      <div className="tab-bar">
        <div className="tab">
          集合
          <span className="count">{projectsState.length}</span>
        </div>
        {username === login && (
          <Button
            icon="cube-add"
            text="新建"
            onClick={createProject}
            style={{ marginLeft: 'auto', alignSelf: 'center' }}
          />
        )}
      </div>
      <div className="project-list">
        {projectsState &&
          projectsState.map(project => (
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
                      onClick={() => handleEditProject(project)}
                    />
                    <Button
                      minimal
                      intent="danger"
                      icon="trash"
                      onClick={() => handleDeleteProject(project.projectId, project.name)}
                    />
                  </ButtonGroup>
                </div>
              )}
            </div>
          ))}
      </div>
      <ProjectDialog
        key={`${show}-${selectedProjectState.projectId}`}
        show={show}
        onClose={onClose}
        username={login}
        fetchUserProjects={fetchUserProjects}
        {...selectedProjectState}
      />
    </div>
  )
}
