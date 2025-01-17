"use client"

import { BarChart3, ArrowUpRight, CircleDot, TrendingUp, Calendar, Mail } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VideoSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Product Overview</h2>
                <p className="text-gray-500 mt-1">See how AvenCRM works in action</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                Live Demo
              </Badge>
            </div>
            
            <Card className="shadow-lg">
            <video
              className="w-full h-full rounded-lg"
              controls
              autoPlay
              src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            >
              Your browser does not support the video tag.
            </video>
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Users</p>
                    <p className="text-2xl font-semibold mt-1">2.4k</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CircleDot className="text-blue-500 w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center text-green-500 text-sm mt-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12% this month</span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Deals Closed</p>
                    <p className="text-2xl font-semibold mt-1">845</p>
                  </div>
                  <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="text-violet-500 w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center text-green-500 text-sm mt-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+25% this month</span>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-semibold mt-1">$8.1M</p>
                  </div>
                  <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-emerald-500 w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center text-green-500 text-sm mt-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+18% this month</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Side Content */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Activities</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="text-blue-500 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Product Demo</p>
                    <p className="text-xs text-gray-500">with Sarah Chen</p>
                    <p className="text-xs text-gray-500 mt-1">Today at 2:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="text-violet-500 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Follow-up Email</p>
                    <p className="text-xs text-gray-500">to Enterprise Clients</p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday at 4:30 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <BarChart3 className="text-emerald-500 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Q1 Goals Review</p>
                    <p className="text-xs text-gray-500">Team Performance</p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Conversion Rate</h3>
              <div className="space-y-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[38%] bg-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current: 38%</span>
                  <span className="text-emerald-500 font-medium">Target: 45%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

