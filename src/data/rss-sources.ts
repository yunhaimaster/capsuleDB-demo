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
    id: 'fooddive',
    title: 'Food Dive',
    description: '食品產業決策者的每日新聞摘要',
    url: 'https://www.fooddive.com/feeds/news/',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'foodsafetynews',
    title: 'Food Safety News',
    description: '食品安全與召回即時資訊',
    url: 'https://www.foodsafetynews.com/feed/',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'foodbusinessnews',
    title: 'Food Business News',
    description: '食品加工與市場趨勢分析',
    url: 'https://www.foodbusinessnews.net/rss/articles',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'vitamin-retailer',
    title: 'Vitamin Retailer Magazine',
    description: '保健品零售產業新聞與專題',
    url: 'https://vitaminretailer.com/feed',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'wholefoodsmag',
    title: 'Whole Foods Magazine',
    description: '天然產品零售與健康產業新聞',
    url: 'https://www.wholefoodsmagazine.com/rss',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'foodsafetymag',
    title: 'Food Safety Magazine',
    description: '食品安全管理、召回與最佳實務',
    url: 'https://www.food-safety.com/rss',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'preparedfoods',
    title: 'Prepared Foods',
    description: '食品研發與成分配方趨勢',
    url: 'https://www.preparedfoods.com/rss/articles',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'newfoodmag',
    title: 'New Food Magazine',
    description: '食品與飲料科學、創新與法規',
    url: 'https://www.newfoodmagazine.com/feed/',
    origin: '英國',
    language: 'en'
  },
  {
    id: 'justfood',
    title: 'Just Food',
    description: '全球食品市場與併購動態',
    url: 'https://www.just-food.com/feed/',
    origin: '英國',
    language: 'en'
  },
  {
    id: 'nutraceuticalsworld',
    title: 'Nutraceuticals World',
    description: '全球保健食品製造與市場新聞',
    url: 'https://www.nutraceuticalsworld.com/rss/all',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'statnews',
    title: 'STAT News',
    description: '醫療、生命科學與保健趨勢',
    url: 'https://www.statnews.com/feed',
    origin: '美國',
    language: 'en'
  },
  {
    id: 'bmj-nutrition',
    title: 'BMJ Nutrition, Prevention & Health',
    description: 'BMJ 營養與預防醫學研究最新文章',
    url: 'https://nutrition.bmj.com/rss/current.xml',
    origin: '英國',
    language: 'en'
  },
  {
    id: 'nutritionfacts',
    title: 'NutritionFacts.org',
    description: 'Greger 醫師整理的科學營養影片與文章',
    url: 'https://nutritionfacts.org/feed',
    origin: '全球',
    language: 'en'
  },
  {
    id: 'bmjnutrition',
    title: 'Nutrition & Life (Podcast)',
    description: '營養生活相關的播客內容更新',
    url: 'https://rss.com/podcasts/nutrition-and-life/feed/',
    origin: '全球',
    language: 'en'
  }
]

