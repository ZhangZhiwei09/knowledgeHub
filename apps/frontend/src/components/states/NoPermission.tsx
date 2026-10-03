import { Button, Result } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

/** 无权限 / 被拒绝访问。提供返回首页的明确路径。 */
export function NoPermission({
  title = '无权访问',
  subTitle = '你当前的角色/权限不足，无法查看该页面。如需访问，请联系管理员申请权限。',
}: {
  title?: string
  subTitle?: string
}) {
  const navigate = useNavigate()
  return (
    <Result
      status="403"
      title={title}
      subTitle={subTitle}
      extra={
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
          返回首页
        </Button>
      }
    />
  )
}
