import { TimerSession, Task, TimerStats, TaskStats } from '../types';
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

export const calculateTimerStats = (sessions: TimerSession[]): TimerStats => {
  const now = new Date();
  const weekStart = startOfWeek(now, { locale: ja });
  const weekEnd = endOfWeek(now, { locale: ja });
  
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const lastWeekSessions = weekDays.map(date => ({
    date,
    count: 0,
    totalTime: 0
  }));

  let totalTime = 0;
  let completedSessions = 0;

  sessions.forEach(session => {
    if (session.completed) {
      completedSessions++;
      totalTime += session.duration;

      // 週間統計の更新
      const sessionDate = new Date(session.startTime);
      if (sessionDate >= weekStart && sessionDate <= weekEnd) {
        const dayIndex = weekDays.findIndex(day => 
          day.getDate() === sessionDate.getDate() &&
          day.getMonth() === sessionDate.getMonth()
        );
        if (dayIndex !== -1) {
          lastWeekSessions[dayIndex].count++;
          lastWeekSessions[dayIndex].totalTime += session.duration;
        }
      }
    }
  });

  return {
    totalSessions: sessions.length,
    totalTime,
    completedSessions,
    averageSessionTime: completedSessions > 0 ? totalTime / completedSessions : 0,
    lastWeekSessions
  };
};

export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const completedTasks = tasks.filter(task => task.isCompleted);
  const now = new Date();
  const overdueTasks = tasks.filter(task => 
    !task.isCompleted && new Date(task.datetime) < now
  );

  // カテゴリ別の統計
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category || 'その他';
    const existing = acc.find(item => item.category === category);
    if (existing) {
      existing.count++;
      if (task.isCompleted) existing.completed++;
    } else {
      acc.push({
        category,
        count: 1,
        completed: task.isCompleted ? 1 : 0
      });
    }
    return acc;
  }, [] as { category: string; count: number; completed: number; }[]);

  // 優先度別の統計
  const tasksByPriority = tasks.reduce((acc, task) => {
    const priority = task.priority || 'medium';
    const existing = acc.find(item => item.priority === priority);
    if (existing) {
      existing.count++;
      if (task.isCompleted) existing.completed++;
    } else {
      acc.push({
        priority,
        count: 1,
        completed: task.isCompleted ? 1 : 0
      });
    }
    return acc;
  }, [] as { priority: string; count: number; completed: number; }[]);

  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    tasksByCategory,
    tasksByPriority
  };
}; 