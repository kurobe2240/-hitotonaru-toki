import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Chip,
  Fab,
  alpha,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWeekend,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import useStore from '../../store/useStore';
import { Task } from '../../types';
import ErrorBoundary from '../ErrorBoundary';
import TaskDialog from './TaskDialog';
import TaskEditDialog from './TaskEditDialog';

// 月曜日始まりの曜日配列
const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

const CalendarView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { tasks, categories, addTask, updateTask, deleteTask } = useStore((state) => ({
    tasks: state.tasks,
    categories: state.categories,
    addTask: state.addTask,
    updateTask: state.updateTask,
    deleteTask: state.deleteTask,
  }));

  // 月の日付を生成（月曜日始まり）
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ja, weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { locale: ja, weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // 日付ごとのタスクを集計
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const dateKey = format(new Date(task.datetime), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  // 月を変更
  const handleMonthChange = useCallback((delta: number) => {
    setCurrentDate((prev) =>
      delta > 0 ? addMonths(prev, delta) : subMonths(prev, Math.abs(delta))
    );
  }, []);

  // 今日に移動
  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // タスクの詳細を表示
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  }, []);

  // タスクの編集を開始
  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  }, []);

  // 新規タスクの作成を開始
  const handleCreateTask = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setIsEditDialogOpen(true);
  }, []);

  // タスクの保存
  const handleSaveTask = useCallback((taskData: Omit<Task, 'id'> | Task) => {
    if ('id' in taskData) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }
  }, [addTask, updateTask]);

  // タスクの削除
  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  // 日付のセルを描画
  const renderDay = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateKey] || [];
    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isWeekendDay = isWeekend(date);

    return (
      <Box
        key={dateKey}
        sx={{
          p: 1,
          height: isMobile ? '4rem' : '8rem',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isToday 
            ? alpha(theme.palette.primary.main, 0.1)
            : isWeekendDay
            ? alpha(theme.palette.background.default, 0.5)
            : 'background.paper',
          opacity: isCurrentMonth ? 1 : 0.5,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            transform: 'scale(1.02)',
            boxShadow: theme.shadows[2],
            zIndex: 1,
          },
        }}
        onClick={() => handleCreateTask(date)}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant={isMobile ? 'caption' : 'body2'}
            color={
              format(date, 'E', { locale: ja }) === '日'
                ? 'error.main'
                : format(date, 'E', { locale: ja }) === '土'
                ? 'primary.main'
                : 'textPrimary'
            }
            fontWeight={isToday ? 'bold' : 'normal'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {format(date, 'd')}
            {isToday && (
              <Chip
                label="今日"
                size="small"
                color="primary"
                sx={{ height: 16, '& .MuiChip-label': { px: 0.5, fontSize: '0.6rem' } }}
              />
            )}
          </Typography>
          {dayTasks.length > 0 && (
            <Badge
              badgeContent={dayTasks.length}
              color="primary"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
            />
          )}
        </Box>

        {!isMobile && (
          <Box sx={{ mt: 1 }}>
            {dayTasks.slice(0, 3).map((task) => {
              const category = categories.find(c => c.id === task.category);
              return (
                <Tooltip
                  key={task.id}
                  title={
                    <Box>
                      <Typography variant="body2">{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="textSecondary">
                          {task.description}
                        </Typography>
                      )}
                      {category && (
                        <Typography variant="caption" sx={{ color: category.color }}>
                          {category.name}
                        </Typography>
                      )}
                    </Box>
                  }
                >
                  <Chip
                    label={task.title}
                    size="small"
                    sx={{
                      mb: 0.5,
                      width: '100%',
                      height: 20,
                      bgcolor: category?.color ? alpha(category.color, 0.1) : undefined,
                      borderLeft: '3px solid',
                      borderColor: task.priority === 'high'
                        ? 'error.main'
                        : task.priority === 'medium'
                        ? 'warning.main'
                        : category?.color || 'grey.400',
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  />
                </Tooltip>
              );
            })}
            {dayTasks.length > 3 && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(date);
                  const firstTask = dayTasks[0];
                  if (firstTask) {
                    handleTaskClick(firstTask);
                  }
                }}
              >
                他 {dayTasks.length - 3} 件
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }, [currentDate, tasksByDate, isMobile, handleTaskClick, handleCreateTask, theme, categories]);

  return (
    <ErrorBoundary>
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => handleMonthChange(-1)}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                {format(currentDate, 'yyyy年 M月', { locale: ja })}
              </Typography>
              <IconButton onClick={() => handleMonthChange(1)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="今日">
                <IconButton onClick={handleTodayClick} color="primary">
                  <TodayIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={0}>
            {weekDays.map((day) => (
              <Grid item xs key={day} sx={{ width: `${100 / 7}%` }}>
                <Box
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    bgcolor: 'background.default',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color={
                      day === '日'
                        ? 'error.main'
                        : day === '土'
                        ? 'primary.main'
                        : 'textPrimary'
                    }
                    fontWeight="bold"
                  >
                    {day}
                  </Typography>
                </Box>
              </Grid>
            ))}
            {calendarDays.map((date) => (
              <Grid item xs key={date.toISOString()} sx={{ width: `${100 / 7}%` }}>
                {renderDay(date)}
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Fab
          color="primary"
          aria-label="���スクを追加"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
          onClick={() => handleCreateTask(selectedDate || new Date())}
        >
          <AddIcon />
        </Fab>

        <TaskDialog
          open={isTaskDialogOpen}
          task={selectedTask}
          onClose={() => setIsTaskDialogOpen(false)}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />

        <TaskEditDialog
          open={isEditDialogOpen}
          task={selectedTask}
          initialDate={selectedDate}
          categories={categories}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
            setSelectedDate(null);
          }}
          onSave={(taskData) => {
            handleSaveTask(taskData);
            setIsEditDialogOpen(false);
            setSelectedTask(null);
            setSelectedDate(null);
          }}
        />
      </Box>
    </ErrorBoundary>
  );
};

export default CalendarView; 