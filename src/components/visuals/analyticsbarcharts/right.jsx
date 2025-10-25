
"use client"
import { SmilePlus } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PolarGrid
} from 'recharts';

const chartData = [
  { day: 'Monday', year: 580, Revenue:560 },
  { day: 'Tuesday', year: 720, Revenue:220 },
  { day: 'Wednesday', year: 640, Revenue:170 },
  { day: 'Thursday', year: 780, Revenue:650 },
  { day: 'Friday', year: 680, Revenue:820 },
  { day: 'Saturday', year: 680, Revenue:360 },
  { day: 'Sunday', year: 680, Revenue:180 }
];
const RightBarChart = () =>{
    const rawData = [56, 24, 45, 76, 54, 87, 43];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return(
        <>
        <section className="w-full p-4 h-80 border rounded-sm  border-gray-200 bg-white " >
            <h1 className="text-xl text-black font-semibold">Product category Peformance</h1>
        <ResponsiveContainer width="100%" height="100%">
                          <BarChart  data={chartData}  margin={{ top: 12, right: 0, left: -10, bottom: 0 }}>
                            <PolarGrid />
                            <XAxis 
                              dataKey="day" 
                              axisLine={true}
                              tickLine={true}
                              range="10"
                              tick={{ fontSize: 8, fill: '#6B7280' }}
                              interval={0}
                            />
                            <YAxis  />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                fontSize: '10px'
                              }}
                            />
                            
                            <Bar 
                              dataKey="Revenue" 
                              fill="#FB923C"
                              borderRadius="5px" 
                              radius={[4, 4, 0, 0]}
                              maxBarSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
        </section>
        </>
    )
}
export default RightBarChart
