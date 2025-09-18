import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: '統計報表' }]} />
      
      <div>
        <h1 className="text-3xl font-bold">統計報表</h1>
        <p className="text-muted-foreground">
          生產數據分析與統計
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
            <Construction className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-700">功能開發中</CardTitle>
          <CardDescription className="text-lg">
            統計報表功能正在設計中，敬請期待！
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            我們正在為您設計更強大的統計分析功能，包括：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-700">📊 生產統計</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 月度/年度生產量統計</li>
                <li>• 客戶訂單分析</li>
                <li>• 產品完成率統計</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-700">📈 趨勢分析</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 生產趨勢圖表</li>
                <li>• 原料使用分析</li>
                <li>• 品質指標追蹤</li>
              </ul>
            </div>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              預計在下一版本中推出，感謝您的耐心等待！
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
