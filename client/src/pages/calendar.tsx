import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { Skeleton } from "@/components/ui/skeleton";

export default function Calendar() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { habits, isLoading: habitsLoading } = useHabits();
  const [currentDate, setCurrentDate] = useState(new Date());

  const isLoading = tasksLoading || habitsLoading;

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate]);

  const getDayData = (date: Date | null) => {
    if (!date) return { tasks: [], habits: [] };
    
    const dateStr = date.toISOString().split("T")[0];
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const dayHabits = habits.filter((h) => (h.completedDates || []).includes(dateStr));
    
    return { tasks: dayTasks, habits: dayHabits };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{monthYear}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth} data-testid="button-prev-month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} data-testid="button-next-month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateStr = date.toISOString().split("T")[0];
            const today = new Date().toISOString().split("T")[0];
            const isToday = dateStr === today;
            const { tasks: dayTasks, habits: dayHabits } = getDayData(date);
            const hasOverdue = dayTasks.some((t) => t.dueDate && t.dueDate < today && !t.completed);

            return (
              <div
                key={dateStr}
                className={`aspect-square p-2 rounded-md border-2 ${
                  isToday ? "border-primary bg-primary/5" : "border-border"
                }`}
                data-testid={`calendar-day-${dateStr}`}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                    {date.getDate()}
                  </span>
                  
                  {/* Show task indicators */}
                  {dayTasks.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <Badge
                          key={task.id}
                          variant={task.completed ? "secondary" : "default"}
                          className="text-xs px-1.5 py-0.5"
                        >
                          {task.priority[0]}
                        </Badge>
                      ))}
                      {dayTasks.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          +{dayTasks.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Habit completion indicator */}
                  {dayHabits.length > 0 && (
                    <div className="mt-1 text-xs text-primary font-medium">
                      {dayHabits.length} habit{dayHabits.length > 1 ? "s" : ""}
                    </div>
                  )}

                  {hasOverdue && (
                    <div className="mt-auto text-xs text-red-500 font-medium">Overdue</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Badge className="text-xs">H</Badge>
            <span className="text-sm text-muted-foreground">High priority task</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">M</Badge>
            <span className="text-sm text-muted-foreground">Medium priority task</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">L</Badge>
            <span className="text-sm text-muted-foreground">Low priority task</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">+N</span> indicates additional tasks
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="text-primary">Habit count</span> shows habits completed that day
          </div>
          <div className="text-sm text-red-500">
            <span className="font-medium">Overdue</span> tasks due on that day
          </div>
        </div>
      </Card>
    </div>
  );
}
