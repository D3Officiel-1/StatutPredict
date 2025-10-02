'use client';

import { TrendingUp } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react";

const generateChartData = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
        let responseTime;
        // Create some spikes to look like a heartbeat
        if (i % 6 === 0) {
            responseTime = parseFloat((Math.random() * 0.2 + 0.3).toFixed(2)); // Spike
        } else if (i % 6 === 1) {
            responseTime = parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)); // Dip
        }
        else {
            responseTime = parseFloat((Math.random() * 0.1 + 0.1).toFixed(2)); // Baseline
        }
        data.push({ time: `${i}:00`, responseTime });
    }
    return data;
};


const chartConfig = {
  responseTime: {
    label: "Temps de réponse (s)",
    color: "hsl(var(--chart-2))",
  },
}

export default function ResponseTimeChart() {
    const [chartData, setChartData] = useState(generateChartData());

    useEffect(() => {
        // This avoids hydration mismatch by generating data on client
        setChartData(generateChartData());
    }, [])

  return (
    <ChartContainer config={chartConfig} className="h-[150px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--chart-2) / 0.2)"
        />
        <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={() => ""}
        />
        <YAxis
          domain={[0, 0.6]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={() => ""}
        />
        <ChartTooltip
          cursor={{stroke: 'hsl(var(--chart-2))', strokeWidth: 1, strokeDasharray: '3 3'}}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(value, payload) => payload?.[0]?.payload.time || value}
              formatter={(value) => [`${value} s`, "Réponse"]}
            />
          }
        />
        <Line
          dataKey="responseTime"
          type="monotone"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
