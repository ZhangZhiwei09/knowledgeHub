import { Button, Result } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

/** 请求失败状态。支持重试和返回主页。 */
export function ErrorState({
  title = '加载失败',
  subTitle,
  onRetry,
}: {
  title?: string
  subTitle?: string
  onRetry?: () => void
}) {
  return (
    <Result
      status="warning"
      title={title}
      subTitle={subTitle ?? '网络或服务端异常，请稍后重试'}
      extra={
        onRetry ? (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            重试
          </Button>
        ) : null
      }
    />
  )
}
