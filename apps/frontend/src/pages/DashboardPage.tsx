import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClusterOutlined,
  FileTextOutlined,
  MessageOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Statistic, Table, Tag } from 'antd'
import { documentApi, userApi } from '../api'
import type { DocumentItem, UserStats } from '../types'
import { useAuth } from '../auth'
import { DOC_STATUS, can, formatTime, visibilityMeta } from '../utils'
import { FileTypeIcon } from '../components/FileTypeIcon'

/** 工作台首页：个人统计与近期文档快捷入口 */
export default function DashboardPage() {
  const user = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [docs, setDocs] = useState<DocumentItem[]>([])

  useEffect(() => {
    userApi.stats().then(setStats).catch(() => undefined)
    if (can(user, 'document:list')) {
      documentApi
        .list({ page: 1, pageSize: 8 })
        .then((res) => setDocs(res.items))
        .catch(() => undefined)
    }
  }, [user])

  return (
    <div>
      <h2 className="kh-page-title">工作概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card className="kh-stat-card">
            <Statistic
              title="我的文档"
              value={stats?.documentCount ?? 0}
              valueStyle={{ color: 'var(--kh-primary-strong)', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="kh-stat-card">
            <Statistic
              title="浏览合计"
              value={stats?.viewCount ?? 0}
              valueStyle={{ color: 'var(--kh-primary-strong)', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="kh-stat-card">
            <Statistic
              title="点赞合计"
              value={stats?.likeCount ?? 0}
              valueStyle={{ color: 'var(--kh-primary-strong)', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="kh-stat-card">
            <Statistic
              title="评论合计"
              value={stats?.commentCount ?? 0}
              valueStyle={{ color: 'var(--kh-primary-strong)', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        {can(user, 'document:list') ? (
          <Col span={6}>
            <Card className="kh-quick-card" hoverable onClick={() => navigate('/documents')}>
              <FileTextOutlined className="kh-quick-icon" /> 文档管理
            </Card>
          </Col>
        ) : null}
        {can(user, 'search') ? (
          <>
            <Col span={6}>
              <Card className="kh-quick-card" hoverable onClick={() => navigate('/search')}>
                <SearchOutlined className="kh-quick-icon" /> 文档搜索
              </Card>
            </Col>
            <Col span={6}>
              <Card className="kh-quick-card" hoverable onClick={() => navigate('/chat')}>
                <MessageOutlined className="kh-quick-icon" /> AI 问答
              </Card>
            </Col>
            <Col span={6}>
              <Card className="kh-quick-card" hoverable onClick={() => navigate('/graph')}>
                <ClusterOutlined className="kh-quick-icon" /> 知识图谱
              </Card>
            </Col>
          </>
        ) : null}
      </Row>
      <div className="kh-page" style={{ marginTop: 16 }}>
        <h3 className="kh-section-title">最近可见文档</h3>
        <Table
          rowKey="id"
          size="middle"
          pagination={false}
          dataSource={docs}
          columns={[
            {
              title: '标题',
              dataIndex: 'title',
              render: (title: string, row: DocumentItem) => (
                <a
                  onClick={() => navigate(`/documents/${row.id}`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <FileTypeIcon name={title} />
                  {title}
                </a>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 100,
              render: (status: number) => (
                <Tag color={DOC_STATUS[status]?.color}>{DOC_STATUS[status]?.label ?? status}</Tag>
              ),
            },
            {
              title: '可见性',
              width: 110,
              render: (_: unknown, row: DocumentItem) => {
                const vis = visibilityMeta(row)
                return <Tag color={vis.color}>{vis.label}</Tag>
              },
            },
            { title: '更新时间', dataIndex: 'updatedAt', render: formatTime },
          ]}
        />
      </div>
    </div>
  )
}
