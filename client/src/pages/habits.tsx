import { useMemo } from "react";
import { Target, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HabitCard } from "@/components/habit-card";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { ProgressChart } from "@/components/progress-chart";
import { useHabits } from "@/hooks/use-habits";
import { Skeleton } from "@/components/ui/skeleton";

export default function Habits() {
  const {
    habits,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleTodayCompletion,
    isCompletedToday,
    getCompletionRate,
    getWeeklyData,
  } = useHabits();

  const stats = useMemo(() => {
    const total = habits.length;
    const completedToday = habits.filter((h) => isCompletedToday(h.id)).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
    const avgCompletionRate = habits.length > 0
      ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h.id), 0) / habits.length)
      : 0;
    return { total, completedToday, totalStreak, avgCompletionRate };
  }, [habits, isCompletedToday, getCompletionRate]);

  const allHabitsWeeklyData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = dayNames[date.getDay()];
      const completedCount = habits.filter((h) => h.completedDates.includes(dateStr)).length;
      data.push({
        day: dayName,
        date: dateStr,
        completed: habits.length > 0 ? completedCount / habits.length : 0,
      });
    }
    return data;
  }, [habits]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" data-testid="habits-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Habits</h1>
          <p className="text-muted-foreground text-sm">
            {stats.completedToday} of {stats.total} completed today
          </p>
        </div>
        <AddHabitDialog onAdd={addHabit} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Habits</p>
          <p className="text-2xl font-semibold mt-1" data-testid="stat-total-habits">
            {stats.total}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Done Today</p>
          <p className="text-2xl font-semibold mt-1" data-testid="stat-done-today">
            {stats.completedToday}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            Total Streak Days
          </p>
          <p className="text-2xl font-semibold mt-1" data-testid="stat-total-streak">
            {stats.totalStreak}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium">Weekly Avg</p>
          <p className="text-2xl font-semibold mt-1" data-testid="stat-weekly-avg">
            {stats.avgCompletionRate}%
          </p>
        </Card>
      </div>

      {habits.length > 0 && (
        <ProgressChart
          title="Weekly Habit Completion Rate"
          data={allHabitsWeeklyData}
          color="hsl(var(--primary))"
        />
      )}

      {habits.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompletedToday={isCompletedToday(habit.id)}
                completionRate={getCompletionRate(habit.id)}
                onToggleToday={toggleTodayCompletion}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Start building habits</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Create habits you want to build and track your progress daily.
            Consistency is key to lasting change.
          </p>
          <AddHabitDialog onAdd={addHabit} />
        </Card>
      )}
    </div>
  );
}
