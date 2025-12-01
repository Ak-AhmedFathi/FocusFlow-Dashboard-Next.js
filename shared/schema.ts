import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface InsertTask {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string | null;
}

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  dueDate: z.string().nullable().optional(),
});

export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  streak: number;
  completedDates: string[];
  createdAt: string;
}

export interface InsertHabit {
  name: string;
  description?: string;
  color?: string;
}

export const insertHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional().default(""),
  color: z.string().optional().default("#14B8A6"),
});

export type PomodoroStatus = "idle" | "work" | "break" | "longBreak";

export interface PomodoroSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  type: "work" | "break" | "longBreak";
  duration: number;
}

export interface PomodoroState {
  status: PomodoroStatus;
  timeRemaining: number;
  sessionsCompleted: number;
  currentSessionStart: string | null;
}

export interface DashboardStats {
  tasksCompleted: number;
  tasksTotal: number;
  habitsTracked: number;
  habitsTotal: number;
  pomodoroSessions: number;
  currentStreak: number;
}
