// 简历数据模板：复制本文件为 data/resume.local.js 并填入自己的内容
// （resume.local.js 已加入 .gitignore，仅本机生效；数据优先级：resume.local.js → 云端 Supabase → 本示例兜底）
// 文本中的 [[内容]] 会被渲染为高亮，用于突出关键成果数字
export default {
  basics: {
    host: 'username',
    intention: '产品经理 · N 年经验',
    gender: '男',
    degree: '本科',
    // 可选：背景行末尾展示的籍贯
    hometown: '某某省某某市',
    school: '某某大学 · 某某专业 · 2016.09 – 2020.07',
    phone: '13800000000',
    // 可选：信息区「作品」行展示的徽章链接，完整展示 url（icon 为 Remixicon 类名，缺省 ri-link）
    links: [
      { url: 'https://github.com/username', icon: 'ri-github-line' },
      { url: 'https://xxx.app', icon: 'ri-macbook-line' },
    ],
  },
  strengths: [
    {
      tag: '懂产品',
      text: '善于探索用户需求，多个从 0 到 1 的项目经验，熟悉产品设计与开发上线流程',
    },
    {
      tag: '懂技术',
      text: '独立开发多个网站与小程序，对行业趋势与前沿技术敏感',
    },
  ],
  jobs: [
    {
      company: '某某科技有限公司',
      role: '产品经理',
      period: '2023.04 – 2024.03',
      duties: [
        '负责核心产品的功能建设，共推进 [[5 项]]重大业务功能落地，客户量提升 [[14%]]',
        '跟进 [[6 个]]以上企业项目的业务需求，推动全部项目顺利交付',
      ],
    },
    {
      company: '自由职业',
      role: '独立产品人',
      period: '2021.01 – 2023.03',
      duties: [
        '独立完成软件产品的设计开发，包括小程序「示例 A」与网站「示例 B」',
      ],
    },
  ],
  achievements: [
    {
      period: '2019',
      text: '全国大学生竞赛「某某系统」，负责设计与宣传，获省级特等奖，产出专利 [[6 项]]',
    },
    {
      period: '2018-19',
      text: '负责两个本科生创新创业计划项目，产出外观设计专利 2 项',
    },
  ],
}
