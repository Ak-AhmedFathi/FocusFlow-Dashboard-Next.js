import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePomodoro } from "@/hooks/use-pomodoro";

interface PomodoroTimerProps {
  compact?: boolean;
}

export function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const {
    state,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    formatTime,
    getProgress,
    SESSIONS_BEFORE_LONG_BREAK,
  } = usePomodoro();

  const progress = getProgress();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusLabel = () => {
    switch (state.status) {
      case "work":
        return "Focus Time";
      case "break":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Ready to Focus";
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case "work":
        return "hsl(var(--primary))";
      case "break":
        return "hsl(172 65% 45%)";
      case "longBreak":
        return "hsl(280 65% 55%)";
      default:
        return "hsl(var(--muted-foreground))";
    }
  };

  if (compact) {
    return (
      <Card className="p-4" data-testid="pomodoro-timer-compact">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getStatusColor()}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium" data-testid="text-pomodoro-time-compact">
                  {formatTime(state.timeRemaining)}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium" data-testid="text-pomodoro-status-compact">
                {getStatusLabel()}
              </p>
              <p className="text-xs text-muted-foreground">
                Session {state.sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK + 1} of {SESSIONS_BEFORE_LONG_BREAK}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={isRunning ? pauseTimer : startTimer}
              data-testid="button-pomodoro-toggle-compact"
            >
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetTimer}
              data-testid="button-pomodoro-reset-compact"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="pomodoro-timer">
      <div className="text-center">
        <div className="relative mx-auto h-48 w-48 mb-6">
          <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getStatusColor()}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-semibold tabular-nums"
              data-testid="text-pomodoro-time"
            >
              {formatTime(state.timeRemaining)}
            </span>
            <span
              className="text-sm text-muted-foreground mt-1"
              data-testid="text-pomodoro-status"
            >
              {getStatusLabel()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {isRunning ? (
            <Button
              size="lg"
              onClick={pauseTimer}
              className="gap-2"
              data-testid="button-pomodoro-pause"
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startTimer}
              className="gap-2"
              data-testid="button-pomodoro-start"
            >
              <Play className="h-5 w-5" />
              {state.status === "idle" ? "Start" : "Resume"}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            data-testid="button-pomodoro-reset"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          {state.status !== "idle" && (
            <Button
              variant="outline"
              size="lg"
              onClick={skipSession}
              data-testid="button-pomodoro-skip"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Session </span>
            <span className="font-medium" data-testid="text-pomodoro-session">
              {state.sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK + 1}
            </span>
            <span className="text-muted-foreground"> of {SESSIONS_BEFORE_LONG_BREAK}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="font-medium" data-testid="text-pomodoro-completed">
              {state.sessionsCompleted}
            </span>
            <span className="text-muted-foreground"> completed today</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
