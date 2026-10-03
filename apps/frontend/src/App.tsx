import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import DocumentEditPage from './pages/DocumentEditPage'
import ChatPage from './pages/ChatPage'
import GraphPage from './pages/GraphPage'
import ProfilePage from './pages/ProfilePage'
import UsersPage from './pages/admin/UsersPage'
import RolesPage from './pages/admin/RolesPage'
import TeamsPage from './pages/admin/TeamsPage'
import ReviewsPage from './pages/admin/ReviewsPage'
import { NoPermission } from './components/states'
import { can, isAdmin, isReviewer } from './utils'

function Guard({ children }: { children: ReactNode }) {
  const user = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Perm({ code, children }: { code: string; children: ReactNode }) {
  const user = useAuth()
  if (!can(user, code))
    return <NoPermission subTitle={`你当前的角色/权限不足（需 ${code}），无法查看该页面。如需访问，请联系管理员申请权限。`} />
  return children
}

/** 路由与鉴权门禁：登录守卫、按权限挂载各业务页 */
export default function App() {
  const user = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <Guard>
            <AppLayout />
          </Guard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="documents"
          element={
            <Perm code="document:list">
              <DocumentsPage />
            </Perm>
          }
        />
        <Route
          path="documents/new"
          element={
            <Perm code="document:create">
              <DocumentEditPage />
            </Perm>
          }
        />
        <Route
          path="documents/:id/edit"
          element={
            <Perm code="document:edit">
              <DocumentEditPage />
            </Perm>
          }
        />
        <Route
          path="documents/:id"
          element={
            <Perm code="document:list">
              <DocumentDetailPage />
            </Perm>
          }
        />
        <Route
          path="search"
          element={
            <Perm code="search">
              <SearchPage />
            </Perm>
          }
        />
        <Route
          path="chat"
          element={
            <Perm code="search">
              <ChatPage />
            </Perm>
          }
        />
        <Route
          path="graph"
          element={
            <Perm code="search">
              <GraphPage />
            </Perm>
          }
        />
        <Route
          path="profile"
          element={
            <Perm code="profile">
              <ProfilePage />
            </Perm>
          }
        />
        <Route
          path="admin/users"
          element={isAdmin(user) ? <UsersPage /> : <NoPermission subTitle="你当前的角色/权限不足（需管理员），无法查看该页面。" />}
        />
        <Route
          path="admin/roles"
          element={isAdmin(user) ? <RolesPage /> : <NoPermission subTitle="你当前的角色/权限不足（需管理员），无法查看该页面。" />}
        />
        <Route
          path="admin/teams"
          element={isAdmin(user) ? <TeamsPage /> : <NoPermission subTitle="你当前的角色/权限不足（需管理员），无法查看该页面。" />}
        />
        <Route
          path="admin/reviews"
          element={isReviewer(user) ? <ReviewsPage /> : <NoPermission subTitle="你当前的角色/权限不足（需审核员），无法查看该页面。" />}
        />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
