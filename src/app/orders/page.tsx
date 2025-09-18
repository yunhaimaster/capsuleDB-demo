import { OrdersList } from '@/components/orders/orders-list'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: '生產記錄管理' }]} />
      
      {/* Header Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl mb-4">
          <span className="text-xl">📋</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          生產記錄管理
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          檢視與管理所有膠囊配方生產記錄，支援搜尋、篩選與匯出功能
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <span className="text-white text-sm">📊</span>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600">總記錄數</p>
                <p className="text-lg font-bold text-blue-700">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <span className="text-white text-sm">✅</span>
              </div>
              <div>
                <p className="text-xs font-medium text-green-600">已完成</p>
                <p className="text-lg font-bold text-green-700">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <span className="text-white text-sm">⏳</span>
              </div>
              <div>
                <p className="text-xs font-medium text-orange-600">進行中</p>
                <p className="text-lg font-bold text-orange-700">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <span className="text-white text-sm">📈</span>
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600">完成率</p>
                <p className="text-lg font-bold text-purple-700">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OrdersList />
    </div>
  )
}
