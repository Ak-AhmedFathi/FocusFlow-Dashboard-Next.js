import type { Task, Habit, PomodoroState, PomodoroSession } from "@shared/schema";

const STORAGE_KEYS = {
  TASKS: "focusflow-tasks",
  HABITS: "focusflow-habits",
  POMODORO_STATE: "focusflow-pomodoro-state",
  POMODORO_SESSIONS: "focusflow-pomodoro-sessions",
} as const;

function generateId(): string {
  return crypto.randomUUID();
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDefaultTasks(): Task[] {
  const today = getToday();
  return [
    {
      id: generateId(),
      title: "Review project requirements",
      description: "Go through the project specs and create a plan",
      priority: "high",
      completed: false,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: "Morning workout",
      description: "30 minutes cardio + stretching",
      priority: "medium",
      completed: true,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: "Read documentation",
      description: "Study React hooks and patterns",
      priority: "low",
      completed: false,
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: "Team standup meeting",
      description: "Daily sync with the development team",
      priority: "high",
      completed: false,
      dueDate: today,
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultHabits(): Habit[] {
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split("T")[0];
  
  return [
    {
      id: generateId(),
      name: "Morning Meditation",
      description: "10 minutes of mindfulness",
      color: "#14B8A6",
      streak: 5,
      completedDates: [twoDaysAgo, yesterday, today],
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: "Read for 30 minutes",
      description: "Reading books or articles",
      color: "#F97316",
      streak: 3,
      completedDates: [yesterday],
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: "Exercise",
      description: "Physical activity for at least 20 minutes",
      color: "#8B5CF6",
      streak: 7,
      completedDates: [twoDaysAgo, yesterday, today],
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: "Drink 8 glasses of water",
      description: "Stay hydrated throughout the day",
      color: "#3B82F6",
      streak: 2,
      completedDates: [today],
      createdAt: new Date().toISOString(),
    },
  ];
}

function getDefaultPomodoroState(): PomodoroState {
  return {
    status: "idle",
    timeRemaining: 25 * 60,
    sessionsCompleted: 0,
    currentSessionStart: null,
  };
}

export const storage = {
  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        return JSON.parse(stored);
      }
      const defaults = getDefaultTasks();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(defaults));
      return defaults;
    } catch {
      return getDefaultTasks();
    }
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getHabits(): Habit[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (stored) {
        return JSON.parse(stored);
      }
      const defaults = getDefaultHabits();
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(defaults));
      return defaults;
    } catch {
      return getDefaultHabits();
    }
  },

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getPomodoroState(): PomodoroState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POMODORO_STATE);
      if (stored) {
        return JSON.parse(stored);
      }
      return getDefaultPomodoroState();
    } catch {
      return getDefaultPomodoroState();
    }
  },

  savePomodoroState(state: PomodoroState): void {
    localStorage.setItem(STORAGE_KEYS.POMODORO_STATE, JSON.stringify(state));
  },

  getPomodoroSessions(): PomodoroSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POMODORO_SESSIONS);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  },

  savePomodoroSessions(sessions: PomodoroSession[]): void {
    localStorage.setItem(STORAGE_KEYS.POMODORO_SESSIONS, JSON.stringify(sessions));
  },

  addPomodoroSession(session: Omit<PomodoroSession, "id">): PomodoroSession {
    const sessions = this.getPomodoroSessions();
    const newSession: PomodoroSession = {
      ...session,
      id: generateId(),
    };
    sessions.push(newSession);
    this.savePomodoroSessions(sessions);
    return newSession;
  },
};
