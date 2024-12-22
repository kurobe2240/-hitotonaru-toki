import { Task, NotificationSettings, NotificationTemplate } from '../types';
import { format, differenceInMinutes, addDays, addWeeks, addMonths, isBefore } from 'date-fns';
import {
  evaluateNotificationRules,
  applyNotificationTemplate,
  showNotification,
  playNotificationSound,
  scheduleNotification,
  cancelScheduledNotification,
} from './notificationUtils';

// タイムアウトIDの型定義
type TimeoutId = ReturnType<typeof setTimeout>;

// 次回の繰り返し日時を計算する
const getNextRecurringDate = (
  currentDate: Date,
  pattern: NonNullable<Task['recurringPattern']>
): Date => {
  const { type, interval } = pattern;
  
  switch (type) {
    case 'daily':
      return addDays(currentDate, interval);
    case 'weekly':
      return addWeeks(currentDate, interval);
    case 'monthly':
      return addMonths(currentDate, interval);
    default:
      return currentDate;
  }
};

// タスクの通知をスケジュールする
export const scheduleTaskNotification = (
  task: Task,
  settings: NotificationSettings,
  onTaskClick?: (taskId: string) => void
): TimeoutId[] => {
  const scheduledNotifications: TimeoutId[] = [];

  // 通知ルールを評価
  const result = evaluateNotificationRules(
    settings.rules,
    'task',
    task
  );

  // 通知が無効化されている場合は何もしない
  if (!result.shouldNotify) {
    return scheduledNotifications;
  }

  // テンプレートを取得
  const templateId = result.template || settings.taskNotifications.template || 'task-default';
  const template = settings.templates.find(t => t.id === templateId);
  if (!template) return scheduledNotifications;

  // 通知音を設定
  const sound = result.sound || template.sound || settings.sound;

  // カスタムメッセージがある場合は、テンプレートのメッセージを上書き
  const customTemplate: NotificationTemplate = {
    ...template,
    message: result.message || template.message,
  };

  const scheduleNotificationWithTemplate = (
    delayInMinutes: number,
    variables: Record<string, string | number>
  ) => {
    const notification = applyNotificationTemplate(customTemplate, variables);
    const timeoutId = scheduleNotification(
      notification.title,
      {
        ...notification.options,
        onClick: onTaskClick ? () => onTaskClick(task.id) : undefined,
      },
      delayInMinutes
    );
    scheduledNotifications.push(timeoutId);

    // 通知が表示されるタイミングで通知音を再生するようにスケジュール
    if (sound) {
      const soundTimeoutId = setTimeout(() => {
        playNotificationSound(sound, settings.volume);
      }, delayInMinutes * 60 * 1000);
      scheduledNotifications.push(soundTimeoutId);
    }
  };

  const now = new Date();
  const taskDate = new Date(task.datetime);
  const minutesUntilDeadline = differenceInMinutes(taskDate, now);

  // 期限前の通知
  if (settings.taskNotifications.beforeDeadline &&
      minutesUntilDeadline > settings.taskNotifications.beforeDeadlineMinutes) {
    const delayInMinutes = minutesUntilDeadline - settings.taskNotifications.beforeDeadlineMinutes;
    scheduleNotificationWithTemplate(delayInMinutes, {
      title: task.title,
      time: format(taskDate, 'HH:mm'),
      description: task.description || '',
    });
  }

  // 期限時の通知
  if (settings.taskNotifications.onDeadline && minutesUntilDeadline > 0) {
    scheduleNotificationWithTemplate(minutesUntilDeadline, {
      title: task.title,
      time: format(taskDate, 'HH:mm'),
      description: task.description || '',
    });
  }

  // 繰り返しタスクの通知
  if (settings.taskNotifications.recurringTasks &&
      task.isRecurring &&
      task.recurringPattern) {
    let nextDate = getNextRecurringDate(taskDate, task.recurringPattern);
    
    // 終了日が設定されている場合は、その日までの通知をスケジュール
    while (
      (!task.recurringPattern.endDate || 
       isBefore(nextDate, new Date(task.recurringPattern.endDate))) &&
      // 最大3ヶ月先までの通知をスケジュール
      isBefore(nextDate, addMonths(now, 3))
    ) {
      const minutesUntilNextDeadline = differenceInMinutes(nextDate, now);

      // 期限前の通知
      if (settings.taskNotifications.beforeDeadline &&
          minutesUntilNextDeadline > settings.taskNotifications.beforeDeadlineMinutes) {
        const delayInMinutes = minutesUntilNextDeadline - settings.taskNotifications.beforeDeadlineMinutes;
        scheduleNotificationWithTemplate(delayInMinutes, {
          title: task.title,
          time: format(nextDate, 'yyyy/MM/dd HH:mm'),
          description: task.description || '',
        });
      }

      // 期限時の通知
      if (settings.taskNotifications.onDeadline && minutesUntilNextDeadline > 0) {
        scheduleNotificationWithTemplate(minutesUntilNextDeadline, {
          title: task.title,
          time: format(nextDate, 'yyyy/MM/dd HH:mm'),
          description: task.description || '',
        });
      }

      // 次の繰り返し日時を計算
      nextDate = getNextRecurringDate(nextDate, task.recurringPattern);
    }
  }

  return scheduledNotifications;
};

// タスクの通知をキャンセルする
export const cancelTaskNotifications = (timeoutIds: TimeoutId[]) => {
  timeoutIds.forEach(id => cancelScheduledNotification(id));
};

// タスクの通知をスケジュールし直す
export const rescheduleTaskNotification = (
  task: Task,
  settings: NotificationSettings,
  oldTimeoutIds: TimeoutId[],
  onTaskClick?: (taskId: string) => void
): TimeoutId[] => {
  // 既存の通知をキャンセル
  cancelTaskNotifications(oldTimeoutIds);

  // 新しい通知をスケジュール
  return scheduleTaskNotification(task, settings, onTaskClick);
};

// 通知スケジュールが有効かどうかをチェック
export const isNotificationScheduleEnabled = (
  task: Task,
  settings: NotificationSettings
): boolean => {
  const schedule = settings.taskNotifications.schedule;
  if (!schedule || !schedule.enabled) return true;

  const now = new Date();
  const currentDay = format(now, 'EEE').toLowerCase() as any;

  // 曜日のチェック
  if (schedule.days.length > 0 && !schedule.days.includes(currentDay)) {
    return false;
  }

  // カテゴリのチェック
  if (schedule.categories.length > 0 && task.category &&
      !schedule.categories.includes(task.category)) {
    return false;
  }

  // 優��度のチェック
  if (schedule.priorities.length > 0 &&
      !schedule.priorities.includes(task.priority)) {
    return false;
  }

  // 時間範囲のチェック
  if (schedule.customTime) {
    const currentTime = format(now, 'HH:mm');
    const { start, end } = schedule.customTime;

    // 開始時刻が終了時刻より後の場合（日をまたぐ場合）
    if (start > end) {
      if (!(currentTime >= start || currentTime < end)) {
        return false;
      }
    } else {
      if (!(currentTime >= start && currentTime < end)) {
        return false;
      }
    }
  }

  return true;
}; 