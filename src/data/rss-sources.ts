export interface RssSource {
  id: string
  title: string
  description: string
  url: string
  category: 'global' | 'official' | 'asia' | 'insights'
  origin: string
  language: 'en' | 'zh'
}

export const RSS_SOURCES: RssSource[] = [
  // Global English media
  {
    id: 'nutraingredients',
    title: 'NutraIngredients Europe',
    description: '歐洲營養補充品與功能食品新聞',
    url: 'https://www.nutraingredients.com/rss',
    category: 'global',
    origin: '歐洲',
    language: 'en'
  },
  {
    id: 'nutraingredients-asia',
    title: 'NutraIngredients Asia',
    description: '亞太營養補充品市場與法規資訊',
    url: 'https://www.nutraingredients-asia.com/rss',
    category: 'global',
    origin: '亞太',
    language: 'en'
  },
  {
    id: 'foodbusinessnews',
    title: 'Food Business News',
    description: '食品加工與市場趨勢分析',
    url: 'https://www.foodbusinessnews.net/rss/articles',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'wholefoodsmag',
    title: 'Whole Foods Magazine',
    description: '天然產品零售與健康產業新聞',
    url: 'https://www.wholefoodsmagazine.com/rss',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'nutritionaloutlook',
    title: 'Nutritional Outlook',
    description: '營養產業商業洞察與成分趨勢',
    url: 'https://www.nutritionaloutlook.com/rss',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'nutraceuticalsworld',
    title: 'Nutraceuticals World',
    description: '全球保健食品製造與市場新聞',
    url: 'https://www.nutraceuticalsworld.com/rss',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'fooddivedaily',
    title: 'Food Dive',
    description: '食品產業決策者的每日新聞摘要',
    url: 'https://www.fooddive.com/feeds/news',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'foodsafetynews',
    title: 'Food Safety News',
    description: '食品安全與召回即時資訊',
    url: 'https://www.foodsafetynews.com/feed',
    category: 'global',
    origin: '美國',
    language: 'en'
  },

  // Official / Associations
  {
    id: 'efsa-publications',
    title: 'EFSA Publications',
    description: '歐盟食品安全局的科學意見與報告',
    url: 'https://www.efsa.europa.eu/en/rss/publications',
    category: 'official',
    origin: '歐盟',
    language: 'en'
  },
  {
    id: 'fda-supplements',
    title: 'FDA Dietary Supplements',
    description: '美國 FDA 營養補充品監管更新',
    url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/dietary-supplements/rss.xml',
    category: 'official',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'tga-alerts',
    title: 'TGA Safety Alerts',
    description: '澳洲 TGA 安全警示與召回',
    url: 'https://www.tga.gov.au/feeds/alert/safety-alerts.xml',
    category: 'official',
    origin: '澳洲',
    language: 'en'
  },
  {
    id: 'crn-news',
    title: 'Council for Responsible Nutrition',
    description: '美國負責任營養委員會產業新聞',
    url: 'https://www.crnusa.org/newsroom/rss',
    category: 'official',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'iadsa-news',
    title: 'IADSA News',
    description: '國際膳食補充品聯盟最新消息',
    url: 'https://www.iadsa.org/rss/news',
    category: 'official',
    origin: '全球',
    language: 'en'
  },

  // Asia / Chinese sources
  {
    id: 'cfs-hk',
    title: '香港食安中心',
    description: '香港食物安全中心食品與保健品公告',
    url: 'https://www.cfs.gov.hk/tc_chi/rss/rss.xml',
    category: 'asia',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'taiwan-tfda',
    title: '台灣食藥署',
    description: '台灣衛福部食藥署食品與保健品資訊',
    url: 'https://www.fda.gov.tw/rss/rss.xml',
    category: 'asia',
    origin: '台灣',
    language: 'zh'
  },
  {
    id: 'nutraingredients-cn',
    title: 'NutraIngredients 中文版',
    description: '保健食品業界中文新聞',
    url: 'https://cn.nutraingredients-asia.com/rss',
    category: 'asia',
    origin: '亞洲',
    language: 'zh'
  },

  // Insights / Blogs
  {
    id: 'examine',
    title: 'Examine.com Research',
    description: '營養補充品研究摘要與解讀',
    url: 'https://examine.com/rss',
    category: 'insights',
    origin: '全球',
    language: 'en'
  },
  {
    id: 'nutritionfacts',
    title: 'NutritionFacts.org',
    description: 'Greger 醫師的科學營養影片與文章',
    url: 'https://nutritionfacts.org/feed',
    category: 'insights',
    origin: '全球',
    language: 'en'
  },
  {
    id: 'ergo-log',
    title: 'Ergo-Log',
    description: '運動營養與補充品實驗報導',
    url: 'https://ergo-log.com/rss',
    category: 'insights',
    origin: '全球',
    language: 'en'
  }
]

