'use client';

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { time: "4:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "5:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "6:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "7:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "8:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "9:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "10:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "11:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "12:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "1:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "2:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "3:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "4:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "5:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "6:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "7:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "8:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "9:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "10:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "11:00pm", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
  { time: "12:00am", responseTime: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)) },
];

const chartConfig = {
  responseTime: {
    label: "Temps de réponse (s)",
    color: "hsl(var(--primary))",
  },
}

export default function ResponseTimeChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/20"/>
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value, index) => {
            const date = new Date(`2024-01-01T${value.replace(/am|pm/i, '')}:00`);
            const hour = date.getHours();
            if (hour % 4 === 0) {
              return value;
            }
            return "";
          }}
          style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          domain={[0, 0.6]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value.toFixed(2)} s`}
          style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => (
                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold text-foreground">{`${value} s`}</span>
                  <span className="text-muted-foreground">{name}</span>
                </div>
              )}
            />
          }
        />
        <Line
          dataKey="responseTime"
          type="monotone"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
