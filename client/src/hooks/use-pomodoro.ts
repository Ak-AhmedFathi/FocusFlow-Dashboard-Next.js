import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PomodoroState, PomodoroSession } from "@shared/schema";
import { storage } from "@/lib/storage";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;

export function usePomodoro() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PomodoroState>(() => storage.getPomodoroState());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: sessions = [] } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro/sessions"],
    enabled: isAuthenticated,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { startedAt: string; completedAt: string; type: string; duration: number }) => {
      const res = await apiRequest("POST", "/api/pomodoro/sessions", sessionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro/sessions"] });
    },
  });

  const saveState = useCallback((newState: PomodoroState) => {
    setState(newState);
    storage.savePomodoroState(newState);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/favicon.png" });
      }
    } catch {
    }
  }, []);

  const startTimer = useCallback(() => {
    requestNotificationPermission();
    
    if (state.status === "idle") {
      const newState: PomodoroState = {
        ...state,
        status: "work",
        timeRemaining: WORK_DURATION,
        currentSessionStart: new Date().toISOString(),
      };
      saveState(newState);
    } else {
      saveState({ ...state, currentSessionStart: new Date().toISOString() });
    }
  }, [state, saveState, requestNotificationPermission]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    saveState({ ...state, currentSessionStart: null });
  }, [state, saveState, clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    saveState({
      status: "idle",
      timeRemaining: WORK_DURATION,
      sessionsCompleted: 0,
      currentSessionStart: null,
    });
  }, [saveState, clearTimer]);

  const skipSession = useCallback(() => {
    clearTimer();
    
    if (state.status === "work") {
      const newSessionsCompleted = state.sessionsCompleted + 1;
      const isLongBreak = newSessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0;
      
      if (isAuthenticated) {
        createSessionMutation.mutate({
          startedAt: state.currentSessionStart || new Date().toISOString(),
          completedAt: new Date().toISOString(),
          type: "work",
          duration: WORK_DURATION - state.timeRemaining,
        });
      } else {
        storage.addPomodoroSession({
          startedAt: state.currentSessionStart || new Date().toISOString(),
          completedAt: new Date().toISOString(),
          type: "work",
          duration: WORK_DURATION - state.timeRemaining,
        });
      }

      saveState({
        status: isLongBreak ? "longBreak" : "break",
        timeRemaining: isLongBreak ? LONG_BREAK_DURATION : BREAK_DURATION,
        sessionsCompleted: newSessionsCompleted,
        currentSessionStart: null,
      });
    } else {
      saveState({
        status: "work",
        timeRemaining: WORK_DURATION,
        sessionsCompleted: state.sessionsCompleted,
        currentSessionStart: null,
      });
    }
  }, [state, saveState, clearTimer, isAuthenticated, createSessionMutation]);

  useEffect(() => {
    if (state.currentSessionStart && state.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            clearTimer();
            
            if (prev.status === "work") {
              const newSessionsCompleted = prev.sessionsCompleted + 1;
              const isLongBreak = newSessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0;
              
              if (isAuthenticated) {
                createSessionMutation.mutate({
                  startedAt: prev.currentSessionStart || new Date().toISOString(),
                  completedAt: new Date().toISOString(),
                  type: "work",
                  duration: WORK_DURATION,
                });
              } else {
                storage.addPomodoroSession({
                  startedAt: prev.currentSessionStart || new Date().toISOString(),
                  completedAt: new Date().toISOString(),
                  type: "work",
                  duration: WORK_DURATION,
                });
              }

              showNotification(
                "Work session complete!",
                isLongBreak ? "Time for a long break!" : "Time for a short break!"
              );

              const newState: PomodoroState = {
                status: isLongBreak ? "longBreak" : "break",
                timeRemaining: isLongBreak ? LONG_BREAK_DURATION : BREAK_DURATION,
                sessionsCompleted: newSessionsCompleted,
                currentSessionStart: null,
              };
              storage.savePomodoroState(newState);
              return newState;
            } else {
              showNotification("Break over!", "Ready to focus again?");
              
              const newState: PomodoroState = {
                status: "work",
                timeRemaining: WORK_DURATION,
                sessionsCompleted: prev.sessionsCompleted,
                currentSessionStart: null,
              };
              storage.savePomodoroState(newState);
              return newState;
            }
          }

          const newState = { ...prev, timeRemaining: newTimeRemaining };
          storage.savePomodoroState(newState);
          return newState;
        });
      }, 1000);
    }

    return () => clearTimer();
  }, [state.currentSessionStart, clearTimer, showNotification, isAuthenticated, createSessionMutation]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getProgress = useCallback(() => {
    let totalDuration: number;
    switch (state.status) {
      case "work":
        totalDuration = WORK_DURATION;
        break;
      case "break":
        totalDuration = BREAK_DURATION;
        break;
      case "longBreak":
        totalDuration = LONG_BREAK_DURATION;
        break;
      default:
        totalDuration = WORK_DURATION;
    }
    return ((totalDuration - state.timeRemaining) / totalDuration) * 100;
  }, [state.status, state.timeRemaining]);

  const isRunning = state.currentSessionStart !== null;

  const getTodaySessions = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (isAuthenticated && sessions.length > 0) {
      return sessions.filter((s) => {
        const sessionDate = new Date(s.startedAt).toISOString().split("T")[0];
        return sessionDate === today && s.type === "work";
      });
    }
    const localSessions = storage.getPomodoroSessions();
    return localSessions.filter((s) => s.startedAt.startsWith(today) && s.type === "work");
  }, [isAuthenticated, sessions]);

  return {
    state,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    formatTime,
    getProgress,
    getTodaySessions,
    WORK_DURATION,
    BREAK_DURATION,
    LONG_BREAK_DURATION,
    SESSIONS_BEFORE_LONG_BREAK,
  };
}
