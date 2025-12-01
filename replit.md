# FocusFlow - Productivity Dashboard

## Overview
FocusFlow is a modern, responsive productivity dashboard built with React, TypeScript, and TailwindCSS. It helps users manage tasks, track habits, and boost focus using the Pomodoro technique.

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Wouter (routing)
- **State Management**: React hooks (useState, useEffect, useContext, useCallback)
- **Data Visualization**: Recharts for progress charts
- **Data Persistence**: LocalStorage
- **UI Components**: Shadcn/ui component library
- **Icons**: Lucide React

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── theme-provider.tsx # Dark/light mode context
│   │   ├── theme-toggle.tsx # Theme toggle button
│   │   ├── task-card.tsx    # Task card component
│   │   ├── habit-card.tsx   # Habit card component
│   │   ├── pomodoro-timer.tsx # Pomodoro timer component
│   │   ├── stat-card.tsx    # Statistics card
│   │   ├── progress-chart.tsx # Progress visualization
│   │   ├── add-task-dialog.tsx
│   │   └── add-habit-dialog.tsx
│   ├── hooks/
│   │   ├── use-tasks.ts     # Task management hook
│   │   ├── use-habits.ts    # Habit tracking hook
│   │   └── use-pomodoro.ts  # Pomodoro timer hook
│   ├── lib/
│   │   ├── storage.ts       # LocalStorage helper
│   │   └── queryClient.ts
│   ├── pages/
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── tasks.tsx        # Task management
│   │   ├── habits.tsx       # Habit tracking
│   │   ├── pomodoro.tsx     # Pomodoro timer
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
shared/
└── schema.ts                # TypeScript interfaces and types
```

## Features

### Dashboard
- Overview of daily tasks, habits, and Pomodoro sessions
- Quick statistics cards
- Active tasks list
- Compact Pomodoro timer widget
- Today's progress visualization

### Tasks
- Create, edit, delete tasks
- Priority levels (High, Medium, Low)
- Due date support
- Mark tasks as complete
- Filter by status or priority
- Sort by priority, due date, or creation date

### Habits
- Create and track daily habits
- Color-coded habits
- Streak counting
- Weekly completion rate
- Visual progress charts

### Pomodoro Timer
- 25-minute work sessions
- 5-minute short breaks
- 15-minute long breaks (every 4 sessions)
- Start, pause, reset, skip controls
- Browser notifications
- Session history

### Theme
- Dark/Light mode toggle
- Persistent theme preference

## Data Persistence
All data is stored in LocalStorage:
- `focusflow-tasks`: Tasks array
- `focusflow-habits`: Habits array
- `focusflow-pomodoro-state`: Timer state
- `focusflow-pomodoro-sessions`: Session history
- `focusflow-theme`: Theme preference

## Running the Project
```bash
npm run dev
```
The application runs on port 5000.

## Design System
- Primary color: Teal (#14B8A6)
- Secondary accent: Orange (#F97316)
- Font: Inter
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
