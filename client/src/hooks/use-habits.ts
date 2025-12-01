import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Habit } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useCallback } from "react";

interface InsertHabitData {
  name: string;
  description?: string;
  color?: string;
}

export function useHabits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const handleError = useCallback((error: Error, action: string) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Session Expired",
        description: "Please sign in again",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    toast({
      title: "Error",
      description: `Failed to ${action}`,
      variant: "destructive",
    });
  }, [toast]);

  const addHabitMutation = useMutation({
    mutationFn: async (habitData: InsertHabitData) => {
      const res = await apiRequest("POST", "/api/habits", habitData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
    onError: (error: Error) => handleError(error, "add habit"),
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Habit> }) => {
      const res = await apiRequest("PATCH", `/api/habits/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
    onError: (error: Error) => handleError(error, "update habit"),
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
    onError: (error: Error) => handleError(error, "delete habit"),
  });

  const addHabit = useCallback((habitData: InsertHabitData) => {
    addHabitMutation.mutate(habitData);
  }, [addHabitMutation]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    updateHabitMutation.mutate({ id, updates });
  }, [updateHabitMutation]);

  const deleteHabit = useCallback((id: string) => {
    deleteHabitMutation.mutate(id);
  }, [deleteHabitMutation]);

  const toggleTodayCompletion = useCallback((id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const completedDates = habit.completedDates || [];
    const isCompletedToday = completedDates.includes(today);
    let newCompletedDates: string[];
    let newStreak: number;

    if (isCompletedToday) {
      newCompletedDates = completedDates.filter((d) => d !== today);
      newStreak = Math.max(0, (habit.streak || 0) - 1);
    } else {
      newCompletedDates = [...completedDates, today];
      newStreak = (habit.streak || 0) + 1;
    }

    updateHabitMutation.mutate({
      id,
      updates: { completedDates: newCompletedDates, streak: newStreak },
    });
  }, [habits, updateHabitMutation]);

  const isCompletedToday = useCallback((id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find((h) => h.id === id);
    return (habit?.completedDates || []).includes(today);
  }, [habits]);

  const getCompletionRate = useCallback((id: string, days: number = 7) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return 0;

    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 86400000);
      dates.push(date.toISOString().split("T")[0]);
    }

    const completedDates = habit.completedDates || [];
    const completed = dates.filter((d) => completedDates.includes(d)).length;
    return Math.round((completed / days) * 100);
  }, [habits]);

  const getWeeklyData = useCallback((id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return [];

    const data = [];
    const completedDates = habit.completedDates || [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      data.push({
        day: dayName,
        date: dateStr,
        completed: completedDates.includes(dateStr) ? 1 : 0,
      });
    }
    return data;
  }, [habits]);

  return {
    habits,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleTodayCompletion,
    isCompletedToday,
    getCompletionRate,
    getWeeklyData,
    isAdding: addHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
  };
}
