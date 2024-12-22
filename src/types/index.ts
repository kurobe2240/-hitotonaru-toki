// タイマー関連の型
export interface TimerPreset {
  id: string;
  name: string;
  duration: number; // 秒単位
  breakDuration: number; // 休憩時間（秒単位）
  autoStartBreak: boolean; // 作業終了後に自動で休憩を開始するか
  autoStartNextSession: boolean; // 休憩終了後に自動で次のセッションを開始するか
  sessionsUntilLongBreak: number; // 長い休憩までのセッション数
  longBreakDuration: number; // 長い休憩時間（秒単位）
  color?: string;
}

export interface TimerSession {
  id: string;
  presetId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
  type: 'work' | 'break' | 'long-break';
  sessionCount: number; // 現在のセッション数
  interruptions: {
    startTime: Date;
    endTime: Date;
    reason?: string;
  }[];
}

// タスク関連の型
export interface Task {
  id: string;
  title: string;
  description?: string;
  datetime: Date;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  isRecurring?: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

// 設定関連の型
export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  days: DayOfWeek[];
  categories: string[];
  priorities: ('low' | 'medium' | 'high')[];
  timeRange?: {
    start: string; // HH:mm形式
    end: string; // HH:mm形式
  };
  conditions?: {
    type: 'timer' | 'task';
    minDuration?: number; // タイマーの最小時間（秒）
    maxDuration?: number; // タイマーの最大時間（秒）
    minTimeUntilDeadline?: number; // タスクの期限までの最小時間（分）
    maxTimeUntilDeadline?: number; // タスクの期限までの最大時間（分）
  };
  actions: {
    mute?: boolean; // 通知を無効化
    overrideSound?: string; // 通知音を上書き
    overrideTemplate?: string; // テンプレートを上書き
    customMessage?: string; // メッセージを上書き
  };
}

// 通知アクションの種類
export type NotificationActionType =
  | 'view'
  | 'complete'
  | 'postpone'
  | 'skip'
  | 'pause'
  | 'restart'
  | 'extend'
  | 'snooze'
  | 'dismiss'
  | 'open';

// 通知テンプレートのアクション定義
export interface NotificationAction {
  action: NotificationActionType;
  label: string;
  data?: any;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  sound: string;
  message: string;
  actions: NotificationAction[];
}

export interface NotificationSchedule {
  id?: string;
  name?: string;
  enabled: boolean;
  type?: 'timer' | 'task';
  days: DayOfWeek[];
  timeRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  priorities?: ('high' | 'medium' | 'low')[];
  customMessage?: string;
  sound?: string;
  template?: string;
}

export interface NotificationSettings {
  sound: string;
  volume: number;
  timerNotifications: {
    beforeEnd: boolean;
    beforeEndMinutes: number;
    onComplete: boolean;
    schedule?: NotificationSchedule;
    template?: string; // テンプレートID
  };
  taskNotifications: {
    beforeDeadline: boolean;
    beforeDeadlineMinutes: number;
    onDeadline: boolean;
    recurringTasks: boolean;
    schedule?: NotificationSchedule;
    template?: string; // テンプレートID
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm形式
    end: string; // HH:mm形式
  };
  templates: NotificationTemplate[];
  rules: NotificationRule[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notificationSound: string;
  showNotifications: boolean;
  defaultTimerDuration: number;
  categories: Category[];
  notifications: NotificationSettings;
}

// 統計情報の型
export interface TimerStats {
  totalSessions: number;
  totalTime: number;
  completedSessions: number;
  averageSessionTime: number;
  lastWeekSessions: {
    date: Date;
    count: number;
    totalTime: number;
  }[];
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByCategory: {
    category: string;
    count: number;
    completed: number;
  }[];
  tasksByPriority: {
    priority: string;
    count: number;
    completed: number;
  }[];
}

export interface NotificationHistory {
  id: string;
  timestamp: Date;
  type: 'timer' | 'task';
  title: string;
  message: string;
  status: 'unread' | 'read' | 'deleted';
  sourceId?: string; // タイマーIDまたはタスクID
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  actions?: NotificationAction[];
  template?: string;
  sound?: string;
}

export interface AppState {
  timerPresets: TimerPreset[];
  timerSessions: TimerSession[];
  tasks: Task[];
  categories: Category[];
  settings: AppSettings;
  rules: NotificationRule[];
  templates: NotificationTemplate[];

  // Timer actions
  addTimerPreset: (preset: Omit<TimerPreset, 'id'>) => void;
  updateTimerPreset: (id: string, preset: Partial<TimerPreset>) => void;
  deleteTimerPreset: (id: string) => void;
  addTimerSession: (session: Omit<TimerSession, 'id'>) => void;
  updateTimerSession: (session: TimerSession) => void;
  deleteTimerSession: (id: string) => void;
  startBreak: (sessionId: string) => void;
  endBreak: (sessionId: string) => void;
  startLongBreak: (sessionId: string) => void;
  endLongBreak: (sessionId: string) => void;
  pauseSession: (sessionId: string, reason?: string) => void;
  resumeSession: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  // Rule actions
  deleteRule: (id: string) => void;
  deleteTemplate: (id: string) => void;
  updateRule: (rule: NotificationRule) => void;
  updateTemplate: (template: NotificationTemplate) => void;
  addRule: (rule: Omit<NotificationRule, 'id'>) => void;
  addTemplate: (template: Omit<NotificationTemplate, 'id'>) => void;

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
} 