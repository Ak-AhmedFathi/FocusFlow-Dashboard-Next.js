import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for server session storage
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default(""),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  completed: boolean("completed").default(false),
  dueDate: varchar("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  dueDate: z.string().nullable().optional(),
});

export type TaskPriority = "high" | "medium" | "low";

// Habits table
export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").default(""),
  color: varchar("color", { length: 10 }).default("#14B8A6"),
  streak: integer("streak").default(0),
  completedDates: text("completed_dates").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
  streak: true,
  completedDates: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Habit name is required"),
  color: z.string().optional().default("#14B8A6"),
});

// Pomodoro sessions table
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  type: varchar("type", { length: 20 }).notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = typeof pomodoroSessions.$inferInsert;

// Client-side types for Pomodoro state (stored in localStorage)
export type PomodoroStatus = "idle" | "work" | "break" | "longBreak";

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
