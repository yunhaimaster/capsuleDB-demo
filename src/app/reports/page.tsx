import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: '統計報表' }]} />
      
      {/* Header Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-4">
          <span className="text-xl">📊</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          統計報表
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          生產數據分析與統計，提供深入的業務洞察
        </p>
      </div>

      {/* Coming Soon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-orange-500 rounded-2xl w-fit">
              <Construction className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-orange-700">功能開發中</CardTitle>
            <CardDescription className="text-lg text-orange-600">
              統計報表功能正在設計中，敬請期待！
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              我們正在為您設計更強大的統計分析功能
            </p>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">
                預計在下一版本中推出，感謝您的耐心等待！
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-700 flex items-center">
              <span className="mr-2">🚀</span>
              即將推出的功能
            </CardTitle>
            <CardDescription className="text-blue-600">
              我們正在開發的統計分析功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 flex items-center">
                <span className="mr-2">📊</span>
                生產統計
              </h4>
              <ul className="text-sm text-blue-600 space-y-2 ml-6">
                <li>• 月度/年度生產量統計</li>
                <li>• 客戶訂單分析</li>
                <li>• 產品完成率統計</li>
                <li>• 生產效率指標</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 flex items-center">
                <span className="mr-2">📈</span>
                趨勢分析
              </h4>
              <ul className="text-sm text-blue-600 space-y-2 ml-6">
                <li>• 生產趨勢圖表</li>
                <li>• 原料使用分析</li>
                <li>• 品質指標追蹤</li>
                <li>• 成本效益分析</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <span className="text-white text-sm">📊</span>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-green-700">實時儀表板</CardTitle>
                <CardDescription className="text-green-600">即時數據監控</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              即時監控生產狀態，快速了解關鍵指標
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <span className="text-white text-sm">📈</span>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-purple-700">趨勢分析</CardTitle>
                <CardDescription className="text-purple-600">歷史數據分析</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              分析歷史趨勢，預測未來生產需求
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-100">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <span className="text-white text-sm">📋</span>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-cyan-700">自定義報表</CardTitle>
                <CardDescription className="text-cyan-600">靈活報表生成</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              根據需求自定義報表格式和內容
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
