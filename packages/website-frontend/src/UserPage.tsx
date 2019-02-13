import React, { useEffect, useState } from 'react'
import { Link, match } from 'react-router-dom'
import { fromNow } from './utils/common'
import { useSession } from './utils/session'
import { Project, UserInfo } from './types'
import Header from './Header'
import { deleteProject, getDetailInfo, getUserProjects } from './utils/server'
import { DeleteIcon, EditIcon, GithubIcon, LogoutIcon } from './icons'
import ProjectDialog from './ProjectDialog'
import './UserPage.styl'

interface Params {
  login: string
}

export default function UserPage({ match }: { match: match<Params> }) {
  return (
    <>
      <Header />
      <div className="user-page">
        <UserProfile login={match.params.login} />
        <UserProjects login={match.params.login} />
      </div>
    </>
  )
}

function UserProfile({ login }: { login: string }) {
  const { username, logout } = useSession()
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
        <img src={userInfoState.avatar_url} alt="avatar-icon" />
        <div className="fullname">{userInfoState.name}</div>
        <div className="username">{login}</div>
        <div className="bio">{userInfoState.bio}</div>
        <a className="email" href={`mailto:${userInfoState.email}`}>
          {userInfoState.email}
        </a>
        <div className="location">{userInfoState.location}</div>
        <div className="divider" />
        <a href={userInfoState.html_url} target="_blank">
          <GithubIcon size={30} />
        </a>
        {username === login && (
          <div
            onClick={() => {
              logout()
            }}
            style={{ cursor: 'pointer' }}
            className="logout"
          >
            <LogoutIcon size={15} />
            <span>Sign out</span>
          </div>
        )}
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
          Projects
          <span className="count">{projectsState.length}</span>
        </div>
        {username === login && (
          <button onClick={createProject} className="create-project-button align-right">
            New Project
          </button>
        )}
      </div>
      <div className="project-list">
        {projectsState &&
          projectsState.map((project, index) => (
            <div className="project-item" key={`project-${index}`}>
              {username === login ? (
                <Link className="project-name" to={`/@${login}/${project.name}`}>
                  {project.name}
                </Link>
              ) : (
                <div className="project-name">{project.name}</div>
              )}
              <div className="project-description">{project.description}</div>
              <div className="project-update">{fromNow(project.updatedAt)}前更新</div>
              {username === login && (
                <div className="manage-project">
                  <span onClick={() => handleEditProject(project)}>
                    <EditIcon />
                  </span>
                  <span onClick={() => handleDeleteProject(project.projectId, project.name)}>
                    <DeleteIcon />
                  </span>
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
