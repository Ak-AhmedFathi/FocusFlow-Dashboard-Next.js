import { format } from "date-fns";
import { CheckSquare, Target, Timer, Flame, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { TaskCard } from "@/components/task-card";
import { HabitCard } from "@/components/habit-card";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { TasksProgressChart } from "@/components/progress-chart";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { tasks, isLoading: tasksLoading, toggleComplete, updateTask, deleteTask, getTodayTasks } = useTasks();
  const { habits, isLoading: habitsLoading, toggleTodayCompletion, isCompletedToday, getCompletionRate, updateHabit, deleteHabit } = useHabits();
  const { state: pomodoroState, getTodaySessions } = usePomodoro();

  const today = new Date();
  const todayTasks = getTodayTasks();
  const completedTodayTasks = todayTasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 3);
  const todaySessions = getTodaySessions();
  const habitsCompletedToday = habits.filter((h) => isCompletedToday(h.id));

  const isLoading = tasksLoading || habitsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-welcome">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          <span data-testid="text-longest-streak">
            Keep your momentum going!
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tasks Today"
          value={`${completedTodayTasks.length}/${todayTasks.length}`}
          subtitle="completed"
          icon={CheckSquare}
          iconColor="text-primary"
        />
        <StatCard
          title="Habits Tracked"
          value={`${habitsCompletedToday.length}/${habits.length}`}
          subtitle="done today"
          icon={Target}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Focus Sessions"
          value={todaySessions.length}
          subtitle="pomodoros today"
          icon={Timer}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Current Streak"
          value={pomodoroState.sessionsCompleted}
          subtitle="sessions this round"
          icon={Flame}
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Tasks</h2>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-tasks">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {pendingTasks.length > 0 ? (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No pending tasks. Great job staying on top of things.
              </p>
              <Link href="/tasks">
                <Button data-testid="button-add-first-task">Add a new task</Button>
              </Link>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pomodoro Timer</h2>
          <PomodoroTimer compact />
          
          <TasksProgressChart
            completed={completedTodayTasks.length}
            total={todayTasks.length || 1}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's Habits</h2>
          <Link href="/habits">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-habits">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.slice(0, 3).map((habit) => (
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
        ) : (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start building positive habits today.
            </p>
            <Link href="/habits">
              <Button data-testid="button-add-first-habit">Create your first habit</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
