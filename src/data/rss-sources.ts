export interface RssSource {
  id: string
  title: string
  description: string
  url: string
  origin: string
  language: 'en' | 'zh'
}

export const RSS_SOURCES: RssSource[] = [
  {
    id: 'cfs-hk',
    title: '香港食物安全中心',
    description: '食物安全中心發布的食品安全風險警示與召回資訊',
    url: 'https://www.cfs.gov.hk/tc_chi/rss/rss.xml',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'nmpa-notice',
    title: '中國國家藥監局通知公告',
    description: '保健食品註冊審批、監管政策與風險警示公告',
    url: 'https://www.nmpa.gov.cn/rss/notice.xml',
    origin: '中國',
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
    description: '中國食品與保健品市場趨勢、企業動態與數據分析',
    url: 'https://www.21food.cn/rss',
    origin: '中國',
    language: 'zh'
  },
  {
    id: 'chc-association',
    title: '中國保健協會',
    description: '協會公告、行業標準與政策解讀',
    url: 'https://www.chc.org.cn/rss',
    origin: '中國',
    language: 'zh'
  },
  {
    id: 'hktdc-health',
    title: '香港貿發局．健康及養生產品',
    description: '香港健康及養生產品的展會活動與市場洞察',
    url: 'https://hkmb.hktdc.com/rss/Industry/Health.xml',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'cnsoc',
    title: '中國營養學會',
    description: '中國營養學會研究成果與學術會議公告',
    url: 'http://www.cnsoc.org.cn/rss/news.xml',
    origin: '中國',
    language: 'zh'
  },
  {
    id: 'nutritionfacts',
    title: 'NutritionFacts.org',
    description: 'Greger 醫師整理的科學營養研究與解讀',
    url: 'https://nutritionfacts.org/feed',
    origin: '全球',
    language: 'en'
  }
]

