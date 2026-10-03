/**
 * 应用入口：挂载 React、Ant Design 中文主题与 BrowserRouter。
 */
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.tsx'
import { khTheme } from './theme/tokens'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <ConfigProvider
      locale={zhCN}
      theme={khTheme}
    >
      <AntdApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
)
