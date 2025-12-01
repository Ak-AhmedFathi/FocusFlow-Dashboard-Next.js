import { randomUUID } from "crypto";
import type { Task, Habit, PomodoroSession, InsertTask, InsertHabit, TaskPriority } from "@shared/schema";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  getHabits(): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;
  
  getPomodoroSessions(): Promise<PomodoroSession[]>;
  createPomodoroSession(session: Omit<PomodoroSession, "id">): Promise<PomodoroSession>;
}

function getDefaultTasks(): Task[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: randomUUID(),
      title: "Review project requirements",
      description: "Go through the project specs and create a plan",
      priority: "high" as TaskPriority,
      completed: false,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      title: "Morning workout",
      description: "30 minutes cardio + stretching",
      priority: "medium" as TaskPriority,
      completed: true,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      title: "Read documentation",
      description: "Study React hooks and patterns",
      priority: "low" as TaskPriority,
      completed: false,
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      title: "Team standup meeting",
      description: "Daily sync with the development team",
      priority: "high" as TaskPriority,
      completed: false,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultHabits(): Habit[] {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split("T")[0];
  
  return [
    {
      id: randomUUID(),
      name: "Morning Meditation",
      description: "10 minutes of mindfulness",
      color: "#14B8A6",
      streak: 5,
      completedDates: [twoDaysAgo, yesterday, today],
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      name: "Read for 30 minutes",
      description: "Reading books or articles",
      color: "#F97316",
      streak: 3,
      completedDates: [yesterday],
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      name: "Exercise",
      description: "Physical activity for at least 20 minutes",
      color: "#8B5CF6",
      streak: 7,
      completedDates: [twoDaysAgo, yesterday, today],
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      name: "Drink 8 glasses of water",
      description: "Stay hydrated throughout the day",
      color: "#3B82F6",
      streak: 2,
      completedDates: [today],
      createdAt: new Date().toISOString(),
    },
  ];
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private habits: Map<string, Habit>;
  private pomodoroSessions: PomodoroSession[];

  constructor() {
    this.tasks = new Map();
    this.habits = new Map();
    this.pomodoroSessions = [];
    
    const defaultTasks = getDefaultTasks();
    defaultTasks.forEach(task => this.tasks.set(task.id, task));
    
    const defaultHabits = getDefaultHabits();
    defaultHabits.forEach(habit => this.habits.set(habit.id, habit));
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description || "",
      priority: insertTask.priority,
      completed: false,
      dueDate: insertTask.dueDate || null,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = {
      id,
      name: insertHabit.name,
      description: insertHabit.description || "",
      color: insertHabit.color || "#14B8A6",
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }

  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return this.pomodoroSessions;
  }

  async createPomodoroSession(session: Omit<PomodoroSession, "id">): Promise<PomodoroSession> {
    const newSession: PomodoroSession = {
      ...session,
      id: randomUUID(),
    };
    this.pomodoroSessions.push(newSession);
    return newSession;
  }
}

export const storage = new MemStorage();
