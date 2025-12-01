import { useState, useCallback, useEffect } from "react";
import type { Habit, InsertHabit } from "@shared/schema";
import { storage } from "@/lib/storage";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedHabits = storage.getHabits();
    setHabits(loadedHabits);
    setIsLoading(false);
  }, []);

  const saveHabits = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits);
    storage.saveHabits(newHabits);
  }, []);

  const addHabit = useCallback((insertHabit: InsertHabit) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: insertHabit.name,
      description: insertHabit.description || "",
      color: insertHabit.color || "#14B8A6",
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    saveHabits([...habits, newHabit]);
    return newHabit;
  }, [habits, saveHabits]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, ...updates } : habit
    );
    saveHabits(updatedHabits);
  }, [habits, saveHabits]);

  const deleteHabit = useCallback((id: string) => {
    const filteredHabits = habits.filter((habit) => habit.id !== id);
    saveHabits(filteredHabits);
  }, [habits, saveHabits]);

  const toggleTodayCompletion = useCallback((id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedHabits = habits.map((habit) => {
      if (habit.id !== id) return habit;

      const isCompletedToday = habit.completedDates.includes(today);
      let newCompletedDates: string[];
      let newStreak: number;

      if (isCompletedToday) {
        newCompletedDates = habit.completedDates.filter((d) => d !== today);
        newStreak = Math.max(0, habit.streak - 1);
      } else {
        newCompletedDates = [...habit.completedDates, today];
        newStreak = habit.streak + 1;
      }

      return {
        ...habit,
        completedDates: newCompletedDates,
        streak: newStreak,
      };
    });
    saveHabits(updatedHabits);
  }, [habits, saveHabits]);

  const isCompletedToday = useCallback((id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find((h) => h.id === id);
    return habit?.completedDates.includes(today) || false;
  }, [habits]);

  const getCompletionRate = useCallback((id: string, days: number = 7) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return 0;

    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 86400000);
      dates.push(date.toISOString().split("T")[0]);
    }

    const completed = dates.filter((d) => habit.completedDates.includes(d)).length;
    return Math.round((completed / days) * 100);
  }, [habits]);

  const getWeeklyData = useCallback((id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return [];

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      data.push({
        day: dayName,
        date: dateStr,
        completed: habit.completedDates.includes(dateStr) ? 1 : 0,
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
  };
}
