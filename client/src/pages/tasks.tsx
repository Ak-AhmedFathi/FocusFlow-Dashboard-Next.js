import { useState, useMemo } from "react";
import { CheckSquare, Filter, SortAsc } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "@/components/task-card";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskPriority } from "@shared/schema";

type SortOption = "priority" | "dueDate" | "created";
type FilterOption = "all" | "pending" | "completed" | TaskPriority;

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export default function Tasks() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filterBy === "pending") {
      filtered = filtered.filter((t) => !t.completed);
    } else if (filterBy === "completed") {
      filtered = filtered.filter((t) => t.completed);
    } else if (filterBy === "high" || filterBy === "medium" || filterBy === "low") {
      filtered = filtered.filter((t) => t.priority === filterBy);
    }

    filtered.sort((a, b) => {
      if (sortBy === "priority") {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [tasks, sortBy, filterBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter((t) => t.priority === "high" && !t.completed).length;
    return { total, completed, pending, highPriority };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="tasks-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            {stats.pending} pending, {stats.completed} completed
          </p>
        </div>
        <AddTaskDialog onAdd={addTask} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
            <SelectTrigger className="w-36" data-testid="select-filter-tasks">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-36" data-testid="select-sort-tasks">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="created">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stats.highPriority > 0 && (
          <div className="ml-auto text-sm text-orange-600 dark:text-orange-400">
            {stats.highPriority} high priority task{stats.highPriority !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {filteredAndSortedTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedTasks.map((task) => (
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
        <Card className="p-12 text-center">
          <CheckSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            {filterBy === "all" ? "No tasks yet" : "No matching tasks"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {filterBy === "all"
              ? "Get started by adding your first task. Break down your goals into actionable items."
              : "Try adjusting your filters to see more tasks."}
          </p>
          {filterBy === "all" && <AddTaskDialog onAdd={addTask} />}
          {filterBy !== "all" && (
            <Button variant="outline" onClick={() => setFilterBy("all")}>
              Clear filters
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
