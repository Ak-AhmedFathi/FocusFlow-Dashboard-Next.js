import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskPriority } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useCallback } from "react";

interface InsertTaskData {
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  dueDate?: string | null;
}

export function useTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
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

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTaskData) => {
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => handleError(error, "add task"),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => handleError(error, "update task"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => handleError(error, "delete task"),
  });

  const addTask = useCallback((taskData: InsertTaskData) => {
    addTaskMutation.mutate(taskData);
  }, [addTaskMutation]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, updates });
  }, [updateTaskMutation]);

  const deleteTask = useCallback((id: string) => {
    deleteTaskMutation.mutate(id);
  }, [deleteTaskMutation]);

  const toggleComplete = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTaskMutation.mutate({ id, updates: { completed: !task.completed } });
    }
  }, [tasks, updateTaskMutation]);

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
    isAdding: addTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}
