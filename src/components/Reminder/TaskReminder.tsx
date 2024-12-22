import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Paper,
} from '@mui/material';
import { Delete, Edit, Notifications, Add as AddIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  datetime: Date;
  isCompleted: boolean;
}

const TaskReminder = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    // LocalStorageからタスクを読み込む
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        datetime: new Date(task.datetime)
      })));
    }

    // 通知の許可を確認
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // タスクの通知をチェックする
    const checkNotifications = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.isCompleted && new Date(task.datetime) <= now) {
          notifyTask(task);
          markTaskAsCompleted(task.id);
        }
      });
    }, 1000);

    return () => clearInterval(checkNotifications);
  }, [tasks]);

  useEffect(() => {
    // タスクの変更をLocalStorageに保存
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const notifyTask = (task: Task) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('タスクリマインダー', {
        body: task.title,
        icon: '/favicon.ico'
      });
    }
  };

  const handleAddTask = () => {
    if (newTask && selectedDate) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        datetime: selectedDate,
        isCompleted: false
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setSelectedDate(new Date());
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setIsDialogOpen(false);
      setEditingTask(null);
    }
  };

  const markTaskAsCompleted = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, isCompleted: true } : task
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom sx={{ mb: 3 }}>
            タスクリマインダー
          </Typography>
          
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="新しいタスク"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                fullWidth
                size="small"
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
              <DateTimePicker
                label="日時"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { bgcolor: 'background.paper', borderRadius: 1 }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddTask}
                disabled={!newTask || !selectedDate}
                startIcon={<AddIcon />}
                sx={{ minWidth: 100, height: 40 }}
              >
                追加
              </Button>
            </Box>
          </Paper>

          <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            <AnimatePresence>
              {tasks
                .filter(task => !task.isCompleted)
                .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
                .map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {task.title}
                          </Typography>
                        }
                        secondary={task.datetime.toLocaleString()}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleEditTask(task)}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleDeleteTask(task.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
            </AnimatePresence>
            {tasks.filter(task => !task.isCompleted).length === 0 && (
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ py: 4 }}
              >
                タスクはありません
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        TransitionComponent={Fade}
        transitionDuration={200}
      >
        <DialogTitle>タスクの編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="タスク名"
              fullWidth
              value={editingTask?.title || ''}
              onChange={(e) => setEditingTask(editingTask ? {
                ...editingTask,
                title: e.target.value
              } : null)}
            />
            <DateTimePicker
              label="日時"
              value={editingTask?.datetime || null}
              onChange={(newValue) => setEditingTask(editingTask ? {
                ...editingTask,
                datetime: newValue || new Date()
              } : null)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleUpdateTask} color="primary" variant="contained">
            更新
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default TaskReminder; 