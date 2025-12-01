import { useState, useCallback, useEffect } from "react";
import type { Task, InsertTask, TaskPriority } from "@shared/schema";
import { storage } from "@/lib/storage";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedTasks = storage.getTasks();
    setTasks(loadedTasks);
    setIsLoading(false);
  }, []);

  const saveTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  }, []);

  const addTask = useCallback((insertTask: InsertTask) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: insertTask.title,
      description: insertTask.description || "",
      priority: insertTask.priority,
      completed: false,
      dueDate: insertTask.dueDate || null,
      createdAt: new Date().toISOString(),
    };
    saveTasks([...tasks, newTask]);
    return newTask;
  }, [tasks, saveTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  const deleteTask = useCallback((id: string) => {
    const filteredTasks = tasks.filter((task) => task.id !== id);
    saveTasks(filteredTasks);
  }, [tasks, saveTasks]);

  const toggleComplete = useCallback((id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  const getTasksByPriority = useCallback((priority: TaskPriority) => {
    return tasks.filter((task) => task.priority === priority);
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter((task) => task.completed);
  }, [tasks]);

  const getPendingTasks = useCallback(() => {
    return tasks.filter((task) => !task.completed);
  }, [tasks]);

  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter((task) => task.dueDate === today);
  }, [tasks]);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    getTasksByPriority,
    getCompletedTasks,
    getPendingTasks,
    getTodayTasks,
  };
}
