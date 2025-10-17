'use client'

import { useEffect, useState } from "react"
import { Api } from "@/services/api-client"
import { Admin, Calculation } from "@prisma/client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"

export default function HomePage({ email }: { email: string }) {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    avgPrice: 0,
    popularMaterial: '',
  })
  const [dailyData, setDailyData] = useState<any[]>([])
  const [materialData, setMaterialData] = useState<any[]>([])
  const [recent, setRecent] = useState<Calculation[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])

  useEffect(() => {
    async function fetchData() {
      const data = await Api.calculations.getAll()

      const total = data.length

      const today = data.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length

      const avgPrice = data.reduce((acc, c) => acc + (c.materialCost || 0), 0) / (data.length || 1)

      const materialMap: Record<string, number> = {}
      data.forEach(c => {
        const mat = c.material || 'Unknown'
        materialMap[mat] = (materialMap[mat] || 0) + 1
      })
      const popularMaterial = Object.entries(materialMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

      const map: Record<string, number> = {}
      data.forEach(c => {
        const day = new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        map[day] = (map[day] || 0) + 1
      })
      
      const dailyData = Object.entries(map).map(([day, count]) => ({ day, count })).sort(
        (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
      )

      const materialData = Object.entries(materialMap).map(([name, value]) => ({ name, value }))

      const recent = data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)

      const admins = await Api.admins.getAll()
      setAdmins(admins)

      setStats({ total, today, avgPrice, popularMaterial })
      setDailyData(dailyData)
      setMaterialData(materialData)
      setRecent(recent)
    }

    fetchData()
  }, [])

  const colors = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#14b8a6']

  return (
    <div className="min-h-screen w-full bg-gray-100 p-8">

      {(admins.length > 0 && !admins.find(a => a.email === email)) ? (
        <div className="flex h-screen items-center justify-center flex-col text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied 🚫</h1>
          <p className="text-gray-700">
            Your account does not have administrator privileges. Please contact the system administrator.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Calculations" value={stats.total} />
            <StatCard title="Today" value={stats.today} />
            <StatCard title="Popular Material" value={stats.popularMaterial} />
            <StatCard title="Average Price (€)" value={stats.avgPrice.toFixed(2)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Calculations by Day</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Material Distribution</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={materialData} dataKey="value" nameKey="name" label>
                      {materialData.map((_, index) => (
                        <Cell key={index} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-none">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Calculations</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-2 rounded-tl-lg">Date</th>
                    <th className="p-2">Material</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 rounded-tr-lg">Total (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c, i) => (
                    <tr key={i} className="border-b hover:bg-gray-100">
                      <td className="p-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">{c.material}</td>
                      <td className="p-2">{c.roll}</td>
                      <td className="p-2">{c.materialCost?.toFixed(2) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}