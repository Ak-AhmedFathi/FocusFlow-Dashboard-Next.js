import { useMemo } from "react";
import { Timer, Coffee, Brain, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Pomodoro() {
  const {
    getTodaySessions,
    WORK_DURATION,
    BREAK_DURATION,
    LONG_BREAK_DURATION,
    SESSIONS_BEFORE_LONG_BREAK,
  } = usePomodoro();

  const sessions = getTodaySessions();

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      count: sessions.length,
      totalTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      totalMinutes,
    };
  }, [sessions]);

  const tips = [
    {
      icon: Brain,
      title: "Focus deeply",
      description: "During work sessions, eliminate all distractions. Close unnecessary tabs and silence notifications.",
    },
    {
      icon: Coffee,
      title: "Take real breaks",
      description: "Step away from your screen during breaks. Stretch, walk, or grab a drink.",
    },
    {
      icon: Trophy,
      title: "Celebrate progress",
      description: "Each completed session is an achievement. Track your daily totals to stay motivated.",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="pomodoro-page">
      <div>
        <h1 className="text-2xl font-semibold">Pomodoro Timer</h1>
        <p className="text-muted-foreground text-sm">
          Focus in {WORK_DURATION / 60}-minute sessions with short breaks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PomodoroTimer />

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-4">How it works</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Work for {WORK_DURATION / 60} minutes</p>
                  <p className="text-muted-foreground text-xs">Focus on a single task</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Take a {BREAK_DURATION / 60}-minute break</p>
                  <p className="text-muted-foreground text-xs">Rest and recharge</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Every {SESSIONS_BEFORE_LONG_BREAK} sessions, take a {LONG_BREAK_DURATION / 60}-minute break</p>
                  <p className="text-muted-foreground text-xs">Longer rest after deep work</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Today's Progress</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold" data-testid="stat-sessions-today">
                  {stats.count}
                </p>
                <p className="text-xs text-muted-foreground">sessions completed</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold" data-testid="stat-focus-time">
                  {stats.totalTime}
                </p>
                <p className="text-xs text-muted-foreground">focus time</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tips for better focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <tip.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Session History</h2>
          <Card className="divide-y">
            {sessions.slice(-5).reverse().map((session, index) => (
              <div key={session.id || index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Focus Session</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(session.startedAt), "h:mm a")}
                      {session.completedAt && (
                        <> - {format(new Date(session.completedAt), "h:mm a")}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.floor(session.duration / 60)} min
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
