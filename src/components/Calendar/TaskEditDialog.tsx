import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Task, Category } from '../../types';

interface TaskEditDialogProps {
  open: boolean;
  task: Task | null | undefined;
  initialDate: Date | null;
  categories: Category[];
  onClose: () => void;
  onSave: (task: Task | Omit<Task, 'id'>) => void;
}

interface TaskFormData {
  title: string;
  description?: string;
  datetime: Date;
  category?: string;
  priority: Task['priority'];
  isCompleted: boolean;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  task,
  initialDate,
  categories,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    datetime: new Date(),
    category: '',
    priority: 'medium',
    isCompleted: false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        datetime: new Date(task.datetime),
      });
    } else if (initialDate) {
      setFormData((prev) => ({
        ...prev,
        datetime: initialDate,
      }));
    }
  }, [task, initialDate]);

  const handleSubmit = () => {
    if (!formData.title || !formData.datetime) return;

    const taskData = {
      ...formData,
      title: formData.title,
      datetime: formData.datetime,
      priority: formData.priority || 'medium',
      isCompleted: formData.isCompleted || false,
    } as Task | Omit<Task, 'id'>;

    onSave(taskData);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setFormData({ ...formData, category: event.target.value });
  };

  const handlePriorityChange = (event: SelectChangeEvent<Task['priority']>) => {
    setFormData({ ...formData, priority: event.target.value as Task['priority'] });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {task ? 'タスクを編集' : 'タスクを作成'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="タイトル"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />

          <TextField
            label="説明"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />

          <DateTimePicker
            label="日時"
            value={formData.datetime}
            onChange={(newValue) => {
              if (newValue) {
                setFormData({ ...formData, datetime: newValue });
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel>カテゴリ��</InputLabel>
            <Select
              value={formData.category || ''}
              onChange={handleCategoryChange}
              label="カテゴリー"
            >
              <MenuItem value="">
                <em>なし</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>優先度</InputLabel>
            <Select
              value={formData.priority}
              onChange={handlePriorityChange}
              label="優先度"
            >
              <MenuItem value="low">低</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="high">高</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {task ? '更新' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog; 