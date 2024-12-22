import { NotificationTemplate } from '../types';

export const defaultNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'task-default',
    name: 'タスクのデフォルト通知',
    message: '{title} - {time}まで\n{description}',
    sound: 'default',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'complete',
        label: '完了',
      },
    ],
  },
  {
    id: 'task-deadline',
    name: 'タスクの期限通知',
    message: '⚠️ {title}の期限が{time}に到来します\n{description}',
    sound: 'alert',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'complete',
        label: '完了',
      },
      {
        action: 'postpone',
        label: '延期',
        data: {
          minutes: 30,
        },
      },
    ],
  },
  {
    id: 'task-recurring',
    name: '繰り返しタスクの通知',
    message: '🔄 {title} - 次回: {time}\n{description}',
    sound: 'default',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'skip',
        label: 'スキップ',
      },
    ],
  },
  {
    id: 'timer-start',
    name: 'タイマー開始通知',
    message: '⏱️ {title}を開始しました\n目標時間: {duration}分',
    sound: 'start',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'pause',
        label: '一時停止',
      },
    ],
  },
  {
    id: 'timer-complete',
    name: 'タイマー完了通知',
    message: '✅ {title}が完了しました！\n経過時間: {elapsed}分',
    sound: 'complete',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'restart',
        label: '再開',
      },
    ],
  },
  {
    id: 'break-start',
    name: '休憩開始通知',
    message: '☕ 休憩時間です\n{duration}分の休憩を開始します',
    sound: 'break',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'skip',
        label: 'スキップ',
      },
    ],
  },
  {
    id: 'break-complete',
    name: '休憩終了通知',
    message: '🎯 休憩終了！\n次のタスクを開始しましょう',
    sound: 'alert',
    actions: [
      {
        action: 'view',
        label: '表示',
      },
      {
        action: 'extend',
        label: '延長',
        data: {
          minutes: 5,
        },
      },
    ],
  },
]; 