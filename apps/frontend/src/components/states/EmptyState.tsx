import { Empty } from 'antd'

/** 空数据状态。description 支持 JSX，用于带操作的空态。 */
export function EmptyState({
  description,
  children,
}: {
  description?: string | React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="kh-empty-state">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
      {children ? <div className="kh-empty-actions">{children}</div> : null}
    </div>
  )
}
