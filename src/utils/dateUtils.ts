import { format, isToday, isThisWeek, isThisMonth, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy年MM月dd日', { locale: ja });
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm', { locale: ja });
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${remainingSeconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

export const getDateRange = (range: 'today' | 'week' | 'month') => {
  const today = new Date();
  
  switch (range) {
    case 'today':
      return (date: Date) => isToday(date);
    case 'week':
      return (date: Date) => isThisWeek(date, { locale: ja });
    case 'month':
      return (date: Date) => isThisMonth(date);
    default:
      return () => true;
  }
};

export const getWeekDates = () => {
  const today = new Date();
  const start = startOfWeek(today, { locale: ja });
  const dates = [];

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(start, i));
  }

  return dates;
};

export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays}日後`;
  } else if (diffInHours > 0) {
    return `${diffInHours}時間後`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes}分後`;
  } else if (diffInSeconds > 0) {
    return `${diffInSeconds}秒後`;
  } else if (diffInSeconds > -60) {
    return 'たった今';
  } else if (diffInMinutes > -60) {
    return `${Math.abs(diffInMinutes)}分前`;
  } else if (diffInHours > -24) {
    return `${Math.abs(diffInHours)}時間前`;
  } else {
    return `${Math.abs(diffInDays)}日前`;
  }
}; 