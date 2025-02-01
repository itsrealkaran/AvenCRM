import { Card, CardContent } from "@/components/ui/card"
import { FaWhatsapp, FaUsers, FaChartBar, FaClock } from "react-icons/fa"

export function MetricsCards() {
  const metrics = [
    {
      title: "Total Campaigns",
      value: "8",
      change: "+10%",
      icon: FaWhatsapp,
      iconColor: "text-[#25D366]", // Updated icon color
    },
    {
      title: "Active Subscribers",
      value: "1,234",
      change: "+5%",
      icon: FaUsers,
      iconColor: "text-blue-500",
    },
    {
      title: "Message Open Rate",
      value: "68%",
      change: "+3%",
      icon: FaChartBar,
      iconColor: "text-purple-500",
    },
    {
      title: "Avg. Response Time",
      value: "2m 30s",
      change: "-10%",
      icon: FaClock,
      iconColor: "text-yellow-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
                <p className="text-sm text-green-600 mt-1">{metric.change} from last month</p>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

