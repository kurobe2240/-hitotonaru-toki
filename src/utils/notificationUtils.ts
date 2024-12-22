import { NotificationRule, NotificationTemplate, Task, TimerSession } from '../types';
import { format, parse, differenceInMinutes } from 'date-fns';

// タイムアウトIDの型定義
type TimeoutId = ReturnType<typeof setTimeout>;

// 通知音を再生する
export const playNotificationSound = (sound: string, volume: number = 0.7) => {
  // TODO: 実際の通知音の再生を実装
  console.log(`Playing sound: ${sound} at volume ${volume}`);
};

// 通知権限をリクエストする
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// 通知を表示する
export const showNotification = (
  title: string,
  options: NotificationOptions & { onClick?: () => void } = {}
) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, options);
  if (options.onClick) {
    notification.onclick = options.onClick;
  }
};

// 通知をスケジュールする
export const scheduleNotification = (
  title: string,
  options: NotificationOptions & { onClick?: () => void } = {},
  delayInMinutes: number
): TimeoutId => {
  const timeoutId = setTimeout(() => {
    showNotification(title, options);
  }, delayInMinutes * 60 * 1000);

  return timeoutId;
};

// スケジュールされた通知をキャンセルする
export const cancelScheduledNotification = (timeoutId: TimeoutId) => {
  clearTimeout(timeoutId);
};

// 通知ルールを評価する
export const evaluateNotificationRules = (
  rules: NotificationRule[],
  type: 'timer' | 'task',
  item: TimerSession | Task,
  currentTime: Date = new Date()
): {
  shouldNotify: boolean;
  template?: string;
  sound?: string;
  message?: string;
} => {
  // ルールを優先度順にソート（降順）
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  // 現在の時刻を HH:mm 形式に変換
  const currentTimeString = format(currentTime, 'HH:mm');

  for (const rule of sortedRules) {
    if (!rule.enabled) continue;
    if (rule.conditions.type !== type) continue;

    // 条件のチェック
    let conditionsMet = true;

    // カテゴリのチェック
    const categories = rule.conditions.categories;
    if (categories && categories.length > 0) {
      if ('category' in item && item.category) {
        if (!categories.includes(item.category)) {
          conditionsMet = false;
        }
      } else {
        conditionsMet = false;
      }
    }

    // 優先度のチェック
    const priorities = rule.conditions.priorities;
    if (priorities && priorities.length > 0) {
      if ('priority' in item) {
        if (!priorities.includes(item.priority)) {
          conditionsMet = false;
        }
      } else {
        conditionsMet = false;
      }
    }

    // 時間範囲のチェック
    if (rule.conditions.timeRange) {
      const { start, end } = rule.conditions.timeRange;

      // 開始時刻が終了時刻より後の場合（日をまたぐ場合）
      if (start > end) {
        if (!(currentTimeString >= start || currentTimeString < end)) {
          conditionsMet = false;
        }
      } else {
        if (!(currentTimeString >= start && currentTimeString < end)) {
          conditionsMet = false;
        }
      }
    }

    // 曜日のチェック
    const days = rule.conditions.days;
    if (days && days.length > 0) {
      const currentDay = format(currentTime, 'EEE').toLowerCase() as any;
      if (!days.includes(currentDay)) {
        conditionsMet = false;
      }
    }

    // タイマー固有の条件チェック
    if (type === 'timer' && 'duration' in item) {
      const { minDuration, maxDuration } = rule.conditions;
      if (minDuration !== undefined && item.duration < minDuration) {
        conditionsMet = false;
      }
      if (maxDuration !== undefined && item.duration > maxDuration) {
        conditionsMet = false;
      }
    }

    // タスク固有の条件チェック
    if (type === 'task' && 'datetime' in item) {
      const minutesUntilDeadline = differenceInMinutes(
        new Date(item.datetime),
        currentTime
      );
      const { minTimeUntilDeadline, maxTimeUntilDeadline } = rule.conditions;
      if (minTimeUntilDeadline !== undefined && 
          minutesUntilDeadline < minTimeUntilDeadline) {
        conditionsMet = false;
      }
      if (maxTimeUntilDeadline !== undefined && 
          minutesUntilDeadline > maxTimeUntilDeadline) {
        conditionsMet = false;
      }
    }

    // 条件が満たされた場合、アクションを適用
    if (conditionsMet) {
      if (rule.actions.mute) {
        return { shouldNotify: false };
      }

      return {
        shouldNotify: true,
        ...(rule.actions.overrideTemplate && { template: rule.actions.overrideTemplate }),
        ...(rule.actions.overrideSound && { sound: rule.actions.overrideSound }),
        ...(rule.actions.customMessage && { message: rule.actions.customMessage }),
      };
    }
  }

  // どのルールも適用されなかった場合はデフォルトの動作
  return { shouldNotify: true };
};

// 通知テンプレートを適用する
export const applyNotificationTemplate = (
  template: NotificationTemplate,
  variables: Record<string, string | number>
): { title: string; options: Omit<NotificationOptions, 'actions'> & { actions?: { action: string; title: string; data?: any }[] } } => {
  let message = template.message;
  
  // 変数の置換
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, String(value));
  });

  return {
    title: message,
    options: {
      body: message,
      icon: '/icon.png', // TODO: アプリのアイコンを設定
      badge: '/badge.png', // TODO: バッジアイコンを設定
      actions: template.actions.map(action => ({
        action: action.action,
        title: action.label,
        ...(action.data && { data: action.data }),
      })),
    },
  };
}; 