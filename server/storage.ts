import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  tasks,
  habits,
  pomodoroSessions,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Habit,
  type InsertHabit,
  type PomodoroSession,
  type InsertPomodoroSession,
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string, userId: string): Promise<Task | undefined>;
  createTask(userId: string, task: Omit<InsertTask, "userId">): Promise<Task>;
  updateTask(id: string, userId: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<boolean>;

  // Habit operations
  getHabits(userId: string): Promise<Habit[]>;
  getHabit(id: string, userId: string): Promise<Habit | undefined>;
  createHabit(userId: string, habit: Omit<InsertHabit, "userId">): Promise<Habit>;
  updateHabit(id: string, userId: string, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string, userId: string): Promise<boolean>;

  // Pomodoro session operations
  getPomodoroSessions(userId: string): Promise<PomodoroSession[]>;
  createPomodoroSession(userId: string, session: Omit<InsertPomodoroSession, "id" | "userId">): Promise<PomodoroSession>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: string, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return task;
  }

  async createTask(userId: string, insertTask: Omit<InsertTask, "userId">): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        userId,
      })
      .returning();
    return task;
  }

  async updateTask(id: string, userId: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Habit operations
  async getHabits(userId: string): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId));
  }

  async getHabit(id: string, userId: string): Promise<Habit | undefined> {
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
    return habit;
  }

  async createHabit(userId: string, insertHabit: Omit<InsertHabit, "userId">): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values({
        ...insertHabit,
        userId,
      })
      .returning();
    return habit;
  }

  async updateHabit(id: string, userId: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const [habit] = await db
      .update(habits)
      .set(updates)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return habit;
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Pomodoro session operations
  async getPomodoroSessions(userId: string): Promise<PomodoroSession[]> {
    return await db
      .select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.userId, userId));
  }

  async createPomodoroSession(
    userId: string,
    session: Omit<InsertPomodoroSession, "id" | "userId">
  ): Promise<PomodoroSession> {
    const [newSession] = await db
      .insert(pomodoroSessions)
      .values({
        ...session,
        userId,
      })
      .returning();
    return newSession;
  }
}

export const storage = new DatabaseStorage();
