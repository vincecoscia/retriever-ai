"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export function WeatherChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
         <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}°F`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temperature"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Temperature (°F)"
        />
        <Line 
           yAxisId="right"
           type="monotone" 
           dataKey="sales" 
           stroke="#82ca9d" 
           strokeWidth={2} 
           name="Sales ($) (Mock)" 
           strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

