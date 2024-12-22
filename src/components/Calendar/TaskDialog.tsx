import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Task } from '../../types';

interface TaskDialogProps {
  open: boolean;
  task: Task | null | undefined;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  task,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            タスクの詳細
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="閉じる">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              label={
                task.priority === 'high'
                  ? '優先度: 高'
                  : task.priority === 'medium'
                  ? '優先度: 中'
                  : '優先度: 低'
              }
              color={
                task.priority === 'high'
                  ? 'error'
                  : task.priority === 'medium'
                  ? 'warning'
                  : 'default'
              }
              size="small"
            />
            {task.category && (
              <Chip
                label={`カテゴリ: ${task.category}`}
                color="primary"
                size="small"
              />
            )}
            {task.isRecurring && (
              <Chip label="繰り返し" color="secondary" size="small" />
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          期限: {format(new Date(task.datetime), 'yyyy年M月d日(E) HH:mm', { locale: ja })}
        </Typography>

        {task.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              説明
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {task.description}
            </Typography>
          </Box>
        )}

        {task.isRecurring && task.recurringPattern && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              繰り返し設定
            </Typography>
            <Typography variant="body2">
              {task.recurringPattern.type === 'daily'
                ? `${task.recurringPattern.interval}日ごと`
                : task.recurringPattern.type === 'weekly'
                ? `${task.recurringPattern.interval}週間ごと`
                : `${task.recurringPattern.interval}ヶ月ごと`}
              {task.recurringPattern.endDate &&
                ` (${format(
                  new Date(task.recurringPattern.endDate),
                  'yyyy年M月d日',
                  { locale: ja }
                )}まで)`}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          color="error"
        >
          削除
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={handleEdit}
          color="primary"
        >
          編集
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog; 