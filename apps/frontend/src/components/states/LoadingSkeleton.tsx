import { Skeleton } from 'antd'

/** 通用内容加载骨架屏。简单数据（单条）用 rows={3}，列表用 rows={6} */
export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="kh-skeleton">
      <Skeleton active paragraph={{ rows }} title={{ width: '40%' }} />
    </div>
  )
}
