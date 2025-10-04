export interface RssSource {
  id: string
  title: string
  description: string
  url: string
  origin: string
  language: 'zh'
}

export const RSS_SOURCES: RssSource[] = [
  {
    id: 'cfs-hk',
    title: '香港食物安全中心',
    description: '食安中心發佈的食品安全風險警示與召回資訊',
    url: 'https://www.cfs.gov.hk/tc_chi/rss/rss.xml',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'nmpa-notice',
    title: '國家藥監局通知公告',
    description: '保健食品註冊審批、政策解讀與風險警示',
    url: 'https://www.nmpa.gov.cn/rss/notice.xml',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'nutraingredients-cn',
    title: 'NutraIngredients-Asia 中文版',
    description: '亞洲保健食品與功能性食品產業新聞',
    url: 'https://cn.nutraingredients-asia.com/rss',
    origin: '亞洲',
    language: 'zh'
  },
  {
    id: '21food',
    title: '中國食品商務網',
    description: '食品及保健品市場趨勢、企業動態與數據分析',
    url: 'https://www.21food.cn/rss',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'chc-association',
    title: '中國保健協會',
    description: '協會公告、行業標準與政策解讀',
    url: 'https://www.chc.org.cn/rss',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'hktdc-health',
    title: '香港貿發局．健康及養生產品',
    description: '健康產品展會資訊與香港市場洞察',
    url: 'https://hkmb.hktdc.com/rss/Industry/Health.xml',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'cnsoc',
    title: '中國營養學會',
    description: '學術會議公告與營養研究成果',
    url: 'http://www.cnsoc.org.cn/rss/news.xml',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'hk01-health',
    title: '香港01 健康養生',
    description: '香港01 的健康、醫療與養生專題',
    url: 'https://www.hk01.com/rss/channel/health',
    origin: '香港',
    language: 'zh'
  }
]

