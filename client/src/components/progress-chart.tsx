import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface ChartDataPoint {
  day: string;
  date: string;
  completed: number;
}

interface ProgressChartProps {
  title: string;
  data: ChartDataPoint[];
  color?: string;
}

export function ProgressChart({ title, data, color = "hsl(var(--primary))" }: ProgressChartProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="p-4" data-testid="progress-chart">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide domain={[0, 1]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                      <p className="font-medium">{data.day}</p>
                      <p className="text-muted-foreground">
                        {data.completed ? "Completed" : "Not completed"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.completed ? color : "hsl(var(--muted))"}
                  opacity={entry.date === today ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

interface TasksChartProps {
  completed: number;
  total: number;
}

export function TasksProgressChart({ completed, total }: TasksChartProps) {
  const data = [
    { name: "Completed", value: completed, fill: "hsl(var(--primary))" },
    { name: "Pending", value: total - completed, fill: "hsl(var(--muted))" },
  ];

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="p-4" data-testid="tasks-progress-chart">
      <h3 className="text-sm font-medium mb-4">Today's Progress</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-semibold" data-testid="text-tasks-percentage">
              {percentage}%
            </span>
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm">Completed</span>
            </div>
            <span className="text-sm font-medium" data-testid="text-tasks-completed">
              {completed}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <span className="text-sm">Pending</span>
            </div>
            <span className="text-sm font-medium" data-testid="text-tasks-pending">
              {total - completed}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
