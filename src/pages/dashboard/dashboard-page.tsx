import {
  DollarSign,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Monitor your business performance and activity."
        action={
          <Button size="sm">
            Download Report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="Rp 125.4M"
          change="+12.5%"
          description="vs last month"
          trend="up"
          icon={DollarSign}
        />

        <StatCard
          title="Customers"
          value="1,248"
          change="+8.2%"
          description="vs last month"
          trend="up"
          icon={Users}
        />

        <StatCard
          title="Orders"
          value="856"
          change="+5.4%"
          description="vs last month"
          trend="up"
          icon={ShoppingCart}
        />

        <StatCard
          title="Transactions"
          value="2,420"
          change="-1.2%"
          description="vs last month"
          trend="down"
          icon={WalletCards}
        />
      </div>

      {/* Revenue Overview + Recent Activity tetap di sini */}
    </div>
  )
}