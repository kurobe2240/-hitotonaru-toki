import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState,
  TimerPreset,
  TimerSession,
  Task,
  Category,
  NotificationRule,
  NotificationTemplate,
  AppSettings,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

const defaultSettings: AppSettings = {
  theme: 'light',
  notificationSound: 'default',
  showNotifications: true,
  defaultTimerDuration: 1500, // 25分
  categories: [],
  notifications: {
    sound: 'default',
    volume: 70,
    timerNotifications: {
      beforeEnd: true,
      beforeEndMinutes: 5,
      onComplete: true,
    },
    taskNotifications: {
      beforeDeadline: true,
      beforeDeadlineMinutes: 30,
      onDeadline: true,
      recurringTasks: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
    templates: [],
    rules: [],
  },
};

const defaultTimerPresets: TimerPreset[] = [
  {
    id: 'pomodoro',
    name: 'ポモドーロ',
    duration: 1500, // 25分
    breakDuration: 300, // 5分
    longBreakDuration: 900, // 15分
    autoStartBreak: true,
    autoStartNextSession: false,
    sessionsUntilLongBreak: 4,
    color: '#f44336',
  },
  {
    id: 'short-work',
    name: '短時間作業',
    duration: 900, // 15分
    breakDuration: 180, // 3分
    longBreakDuration: 600, // 10分
    autoStartBreak: true,
    autoStartNextSession: true,
    sessionsUntilLongBreak: 3,
    color: '#4caf50',
  },
  {
    id: 'long-work',
    name: '長時間作業',
    duration: 2700, // 45分
    breakDuration: 600, // 10分
    longBreakDuration: 1200, // 20分
    autoStartBreak: true,
    autoStartNextSession: false,
    sessionsUntilLongBreak: 3,
    color: '#2196f3',
  },
];

const useStore = create<AppState>()(
  persist(
    (set) => ({
      timerPresets: [
        {
          id: 'default',
          name: 'デフォルト',
          duration: 1500, // 25分
          breakDuration: 300, // 5分
          longBreakDuration: 900, // 15分
          autoStartBreak: true,
          autoStartNextSession: false,
          sessionsUntilLongBreak: 4,
        },
      ],
      timerSessions: [],
      tasks: [],
      categories: [],
      settings: defaultSettings,
      rules: [],
      templates: [],

      // Settings actions
      updateSettings: (newSettings: Partial<AppSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Timer actions
      addTimerPreset: (preset: Omit<TimerPreset, 'id'>) =>
        set((state) => ({
          timerPresets: [
            ...state.timerPresets,
            {
              ...preset,
              id: `preset-${Date.now()}`,
            },
          ],
        })),

      updateTimerPreset: (id: string, preset: Partial<TimerPreset>) =>
        set((state) => ({
          timerPresets: state.timerPresets.map((p) =>
            p.id === id ? { ...p, ...preset } : p
          ),
        })),

      deleteTimerPreset: (id: string) =>
        set((state) => ({
          timerPresets: state.timerPresets.filter((p) => p.id !== id),
        })),

      addTimerSession: (session: Omit<TimerSession, 'id'>) =>
        set((state) => ({
          timerSessions: [...state.timerSessions, { ...session, id: uuidv4() }],
        })),

      updateTimerSession: (session: TimerSession) =>
        set((state) => ({
          timerSessions: state.timerSessions.map((s) =>
            s.id === session.id ? session : s
          ),
        })),

      deleteTimerSession: (id: string) =>
        set((state) => ({
          timerSessions: state.timerSessions.filter((s) => s.id !== id),
        })),

      startBreak: (sessionId: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const preset = state.timerPresets.find((p) => p.id === session.presetId);
          if (!preset) return state;

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    type: 'break',
                    startTime: new Date(),
                    duration: preset.breakDuration,
                  }
                : s
            ),
          };
        }),

      endBreak: (sessionId: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    type: 'work',
                    endTime: new Date(),
                  }
                : s
            ),
          };
        }),

      startLongBreak: (sessionId: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const preset = state.timerPresets.find((p) => p.id === session.presetId);
          if (!preset) return state;

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    type: 'long-break',
                    startTime: new Date(),
                    duration: preset.longBreakDuration,
                  }
                : s
            ),
          };
        }),

      endLongBreak: (sessionId: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    type: 'work',
                    endTime: new Date(),
                    sessionCount: 0, // 長い休憩後はセッションカウントをリセット
                  }
                : s
            ),
          };
        }),

      pauseSession: (sessionId: string, reason?: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const interruption = {
            startTime: new Date(),
            endTime: new Date(), // 一時的に同じ時間を設定
            reason,
          };

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    interruptions: [...s.interruptions, interruption],
                  }
                : s
            ),
          };
        }),

      resumeSession: (sessionId: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const interruptions = [...session.interruptions];
          const lastInterruption = interruptions.pop();
          if (!lastInterruption) return state;

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    interruptions: [
                      ...interruptions,
                      { ...lastInterruption, endTime: new Date() },
                    ],
                  }
                : s
            ),
          };
        }),

      completeSession: (sessionId: string) =>
        set((state) => {
          const session = state.timerSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const preset = state.timerPresets.find((p) => p.id === session.presetId);
          if (!preset) return state;

          const newSessionCount = session.sessionCount + 1;
          const shouldTakeLongBreak =
            newSessionCount >= preset.sessionsUntilLongBreak;

          return {
            timerSessions: state.timerSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    completed: true,
                    endTime: new Date(),
                    sessionCount: shouldTakeLongBreak ? 0 : newSessionCount,
                  }
                : s
            ),
          };
        }),

      // Task actions
      addTask: (task: Omit<Task, 'id'>) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: uuidv4() }],
        })),

      updateTask: (task: Task) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        })),

      deleteTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // Category actions
      addCategory: (category: Omit<Category, 'id'>) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: uuidv4() }],
        })),

      updateCategory: (category: Category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === category.id ? category : c
          ),
        })),

      deleteCategory: (id: string) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      // Rule actions
      addRule: (rule: Omit<NotificationRule, 'id'>) =>
        set((state) => ({
          rules: [...state.rules, { ...rule, id: uuidv4() }],
        })),

      updateRule: (rule: NotificationRule) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === rule.id ? rule : r)),
        })),

      deleteRule: (id: string) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),

      // Template actions
      addTemplate: (template: Omit<NotificationTemplate, 'id'>) =>
        set((state) => ({
          templates: [...state.templates, { ...template, id: uuidv4() }],
        })),

      updateTemplate: (template: NotificationTemplate) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === template.id ? template : t
          ),
        })),

      deleteTemplate: (id: string) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'health-life-manager-storage',
    }
  )
);

export default useStore; 