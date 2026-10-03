import type { ThemeConfig } from 'antd'

/**
 * 全站设计基线：商务蓝 #0B5FD0 + 瑞士式骨架（锐利边角、发丝线分层、卡片零阴影）。
 *
 * 这里是唯一真相源。CSS 侧的同名变量见 index.css 的 :root，两处必须同步修改。
 * canvas 场景（echarts）读不到 CSS 变量，只能从本文件取色。
 */

/** 品牌色与语义色。图表、SVG 等非 DOM 场景一律从这里取。 */
export const KH_COLORS = {
  // 品牌
  /** 商务蓝主色：沿用蓝相，明度压到 L≈0.50，饱和保留 */
  primary: '#0B5FD0',
  primaryHover: '#2C77DC',
  primaryActive: '#094AA3',
  primaryBg: '#EAF2FE',
  primaryBorder: '#BBD3FA',
  /** 数据强调，比主色更沉 */
  primaryStrong: '#123E8C',

  // 中性
  text: '#141414',
  textSecondary: '#454545',
  textTertiary: '#8A8A8A',
  textQuaternary: '#BFBFBF',

  border: '#D9D9D9',
  borderSecondary: '#E5E5E5',
  borderHairline: '#F0F0F0',

  bgLayout: '#FAFAFA',
  bgContainer: '#FFFFFF',
  bgSubtle: '#F5F5F5',
  bgHover: '#F5F7FA',

  // 语义
  success: '#389E0D',
  warning: '#D48806',
  error: '#CF1322',
  /** 检索命中 / AI 引用高亮，全站唯一一处非蓝强调色 */
  highlight: '#FFE9A8',

  /** 知识图谱分类色：ForceGraph 的 echarts 配置与 GraphPage 图例共用 */
  graph: {
    document: '#0B5FD0',
    point: '#389E0D',
    person: '#D48806',
    organization: '#13C2C2',
    tag: '#722ED1',
  },
} as const

/** 动效时长与缓动，与 index.css 的 --kh-dur-* / --kh-ease 保持一致 */
export const KH_MOTION = {
  fast: 120,
  base: 200,
  slow: 320,
  ease: 'cubic-bezier(.2, 0, 0, 1)',
} as const

/**
 * AntD 主题配置。卡片不用投影——层级交给 1px 发丝线；
 * 浮层（下拉/弹窗）保留极弱投影，否则会和正文糊在一起。
 */
export const khTheme: ThemeConfig = {
  token: {
    colorPrimary: KH_COLORS.primary,
    colorPrimaryHover: KH_COLORS.primaryHover,
    colorPrimaryActive: KH_COLORS.primaryActive,
    colorPrimaryBg: KH_COLORS.primaryBg,
    colorPrimaryBorder: KH_COLORS.primaryBorder,
    colorLink: KH_COLORS.primary,

    colorText: KH_COLORS.text,
    colorTextSecondary: KH_COLORS.textSecondary,
    colorTextTertiary: KH_COLORS.textTertiary,
    colorTextQuaternary: KH_COLORS.textQuaternary,

    colorBgLayout: KH_COLORS.bgLayout,
    colorBgContainer: KH_COLORS.bgContainer,
    colorBorder: KH_COLORS.border,
    colorBorderSecondary: KH_COLORS.borderHairline,

    colorSuccess: KH_COLORS.success,
    colorWarning: KH_COLORS.warning,
    colorError: KH_COLORS.error,
    colorInfo: KH_COLORS.primary,

    // 瑞士骨架：收锐边角
    borderRadius: 2,
    borderRadiusXS: 2,
    borderRadiusSM: 2,
    borderRadiusLG: 4,

    fontSize: 14,
    // 西文在前、中文在后：Geist 接住拉丁与数字，汉字穿透到后面的系统中文字体。
    // 中文不引 Web 字体（思源黑单文件 5-15MB），交给 PingFang / 微软雅黑。
    fontFamily:
      '"Geist", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',

    controlHeight: 34,
    controlHeightSM: 26,
    controlHeightLG: 40,

    // 卡片零阴影；二级阴影留给浮层
    boxShadow: 'none',
    boxShadowSecondary: '0 4px 14px rgba(15, 23, 42, .10)',
    boxShadowTertiary: 'none',

    wireframe: true,
  },
  components: {
    Layout: {
      headerBg: KH_COLORS.bgContainer,
      siderBg: KH_COLORS.bgContainer,
      bodyBg: KH_COLORS.bgLayout,
    },
    Menu: {
      itemBorderRadius: 2,
      itemSelectedBg: KH_COLORS.primaryBg,
      itemSelectedColor: KH_COLORS.primary,
      itemHoverBg: KH_COLORS.bgHover,
      // 去掉 inline 选中态左侧竖条，改用浅蓝底 + 文字色
      activeBarHeight: 0,
    },
    Card: { paddingLG: 20 },
    Table: {
      headerBg: KH_COLORS.bgSubtle,
      headerSplitColor: KH_COLORS.borderHairline,
      cellPaddingBlock: 12,
      rowHoverBg: KH_COLORS.bgHover,
    },
    Statistic: { titleFontSize: 13, contentFontSize: 26 },
    Tag: { defaultBg: KH_COLORS.bgSubtle, defaultColor: KH_COLORS.textSecondary },
  },
}
