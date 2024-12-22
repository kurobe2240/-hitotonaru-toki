import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { Task } from '../../types';
import useStore from '../../store/useStore';
import { motion } from 'framer-motion';

const TaskCalendar = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks } = useStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter((task) => isSameDay(new Date(task.datetime), date));
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" component="h2">
          {format(currentDate, 'yyyy年 M月', { locale: ja })}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <Grid item xs key={day}>
            <Typography
              align="center"
              sx={{
                color: day === '日' ? 'error.main' : day === '土' ? 'primary.main' : 'text.primary',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}

        {monthDays.map((date) => {
          const dayTasks = getTasksForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);

          return (
            <Grid item xs key={date.toISOString()}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    minHeight: 100,
                    bgcolor: isCurrentMonth
                      ? 'background.paper'
                      : 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography
                    align="center"
                    sx={{
                      color: !isCurrentMonth
                        ? 'text.disabled'
                        : date.getDay() === 0
                        ? 'error.main'
                        : date.getDay() === 6
                        ? 'primary.main'
                        : 'text.primary',
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {dayTasks.map((task) => (
                      <Chip
                        key={task.id}
                        label={task.title}
                        size="small"
                        sx={{
                          mb: 0.5,
                          width: '100%',
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white',
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default TaskCalendar; 