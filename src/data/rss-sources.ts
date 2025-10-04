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
  {
    id: 'fooddive',
    title: 'Food Dive',
    description: '食品產業決策者的每日新聞摘要',
    url: 'https://www.fooddive.com/feeds/news/',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'foodsafetynews',
    title: 'Food Safety News',
    description: '食品安全與召回即時資訊',
    url: 'https://www.foodsafetynews.com/feed/',
    category: 'global',
    origin: '美國',
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
    id: 'vitamin-retailer',
    title: 'Vitamin Retailer Magazine',
    description: '保健品零售產業新聞與專題',
    url: 'https://vitaminretailer.com/feed',
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
    id: 'foodsafetymag',
    title: 'Food Safety Magazine',
    description: '食品安全管理、召回與最佳實務',
    url: 'https://www.food-safety.com/rss',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'preparedfoods',
    title: 'Prepared Foods',
    description: '食品研發與成分配方趨勢',
    url: 'https://www.preparedfoods.com/rss/articles',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'newfoodmag',
    title: 'New Food Magazine',
    description: '食品與飲料科學、創新與法規',
    url: 'https://www.newfoodmagazine.com/feed/',
    category: 'global',
    origin: '英國',
    language: 'en'
  },
  {
    id: 'justfood',
    title: 'Just Food',
    description: '全球食品市場與併購動態',
    url: 'https://www.just-food.com/feed/',
    category: 'global',
    origin: '英國',
    language: 'en'
  },
  {
    id: 'nutraceuticalsworld',
    title: 'Nutraceuticals World',
    description: '全球保健食品製造與市場新聞',
    url: 'https://www.nutraceuticalsworld.com/rss/all',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'statnews',
    title: 'STAT News',
    description: '醫療、生命科學與保健趨勢',
    url: 'https://www.statnews.com/feed',
    category: 'global',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'bmj-nutrition',
    title: 'BMJ Nutrition, Prevention & Health',
    description: 'BMJ 營養與預防醫學研究最新文章',
    url: 'https://nutrition.bmj.com/rss/current.xml',
    category: 'insights',
    origin: '英國',
    language: 'en'
  },
  {
    id: 'nutritionfacts',
    title: 'NutritionFacts.org',
    description: 'Greger 醫師整理的科學營養影片與文章',
    url: 'https://nutritionfacts.org/feed',
    category: 'insights',
    origin: '全球',
    language: 'en'
  },
  {
    id: 'healthcanada-food',
    title: 'Health Canada - Food & Nutrition',
    description: '加拿大衛生部食品與營養公告',
    url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/rss-feed.xml',
    category: 'official',
    origin: '加拿大',
    language: 'en'
  }
]

