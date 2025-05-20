"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Globe,
  Package,
  ShieldCheck,
  Star,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { dashboardApi, type DashboardStats, type AnalyticsData, type ReportData } from "@/lib/api-dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [reports, setReports] = useState<ReportData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch data based on active tab
      if (activeTab === "overview") {
        const statsData = await dashboardApi.getStats()
        setStats(statsData)
      } else if (activeTab === "analytics") {
        const analyticsData = await dashboardApi.getAnalytics()
        setAnalytics(analyticsData)
      } else if (activeTab === "reports") {
        const reportsData = await dashboardApi.getReports()
        setReports(reportsData)
      }
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.")
      console.error("Dashboard data fetch error:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case "package":
        return <Package className="h-4 w-4 text-primary" />
      case "user":
        return <Users className="h-4 w-4 text-secondary" />
      case "review":
        return <Star className="h-4 w-4 text-primary" />
      case "blog":
        return <FileText className="h-4 w-4 text-secondary" />
      case "business":
        return <ShieldCheck className="h-4 w-4 text-primary" />
      case "event":
        return <Calendar className="h-4 w-4 text-secondary" />
      default:
        return <Package className="h-4 w-4 text-primary" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Ethiopian Travel Platform admin panel.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchData()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Ethiopian Travel Platform admin panel.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading dashboard data...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalPackages || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +12.5%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +18.2%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Destinations</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.destinations || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +4.3%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-destructive flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> -2.5%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>Platform activity summary</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "Packages", value: stats?.totalPackages || 0 },
                            { name: "Users", value: stats?.totalUsers || 0 },
                            { name: "Reviews", value: stats?.totalReviews || 0 },
                            { name: "Blogs", value: stats?.totalBlogs || 0 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-4">
                            <div
                              className={`rounded-full ${
                                activity.type === "package" || activity.type === "review"
                                  ? "bg-faded-pink"
                                  : "bg-faded-blue"
                              } p-2`}
                            >
                              {renderActivityIcon(activity.type)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{activity.details}</p>
                              <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">No recent activity found</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading analytics data...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Package Statistics</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Views</span>
                        <span className="font-medium">{analytics?.packageStats.totalViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bookings</span>
                        <span className="font-medium">{analytics?.packageStats.bookings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">${analytics?.packageStats.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="font-medium text-success">+{analytics?.packageStats.growth}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">User Statistics</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Users</span>
                        <span className="font-medium">{analytics?.userStats.totalUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Users</span>
                        <span className="font-medium">{analytics?.userStats.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New Users</span>
                        <span className="font-medium">{analytics?.userStats.newUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="font-medium text-success">+{analytics?.userStats.growth}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Review Statistics</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Reviews</span>
                        <span className="font-medium">{analytics?.reviewStats.totalReviews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Rating</span>
                        <span className="font-medium">{analytics?.reviewStats.averageRating.toFixed(1)}/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New Reviews</span>
                        <span className="font-medium">{analytics?.reviewStats.newReviews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="font-medium text-success">+{analytics?.reviewStats.growth}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Platform growth over the past 7 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    {analytics?.monthlyData && analytics.monthlyData.length > 0 ? (
                      <ChartContainer
                        config={{
                          packages: { theme: { light: "#8884d8", dark: "#8884d8" } },
                          users: { theme: { light: "#82ca9d", dark: "#82ca9d" } },
                          reviews: { theme: { light: "#ffc658", dark: "#ffc658" } },
                        }}
                      >
                        <BarChart data={analytics.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="packages" fill="var(--color-packages)" name="Packages" />
                          <Bar dataKey="users" fill="var(--color-users)" name="Users" />
                          <Bar dataKey="reviews" fill="var(--color-reviews)" name="Reviews" />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No monthly data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading reports data...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Packages</CardTitle>
                    <CardDescription>Most booked packages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports?.topPackages && reports.topPackages.length > 0 ? (
                        reports.topPackages.map((pkg, index) => (
                          <div key={pkg.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                {index + 1}
                              </div>
                              <div className="font-medium">{pkg.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.bookings} bookings (${pkg.revenue})
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">No package data available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Destinations</CardTitle>
                    <CardDescription>Most visited destinations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports?.topDestinations && reports.topDestinations.length > 0 ? (
                        reports.topDestinations.map((dest, index) => (
                          <div key={dest.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                {index + 1}
                              </div>
                              <div className="font-medium">{dest.name}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{dest.visits.toLocaleString()} visits</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">No destination data available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Demographics</CardTitle>
                    <CardDescription>Age distribution of users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {reports?.userDemographics && reports.userDemographics.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reports.userDemographics}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="percentage"
                              nameKey="ageGroup"
                            >
                              {reports.userDemographics.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No demographic data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Review Sentiment</CardTitle>
                    <CardDescription>Distribution of review sentiments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {reports?.reviewSentiment && reports.reviewSentiment.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reports.reviewSentiment}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="percentage"
                              nameKey="sentiment"
                            >
                              {reports.reviewSentiment.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No sentiment data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
