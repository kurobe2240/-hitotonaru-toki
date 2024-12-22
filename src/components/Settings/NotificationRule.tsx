import React, { memo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Select,
  Chip,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Preview as PreviewIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';
import { NotificationRule as NotificationRuleType } from '../../types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const dayOptions = [
  { value: 'mon', label: '月曜日' },
  { value: 'tue', label: '火曜日' },
  { value: 'wed', label: '水曜日' },
  { value: 'thu', label: '木曜日' },
  { value: 'fri', label: '金曜日' },
  { value: 'sat', label: '土曜日' },
  { value: 'sun', label: '日曜日' },
];

const priorityOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const NotificationRule: React.FC = () => {
  const { rules, deleteRule, categories } = useStore();
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NotificationRuleType | null>(null);

  const handlePreview = useCallback((ruleId: string) => {
    setSelectedRule(ruleId);
    setShowPreview(true);
  }, []);

  const handleEdit = useCallback((rule: NotificationRuleType) => {
    setEditTarget(rule);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((ruleId: string) => {
    setDeleteTargetId(ruleId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteRule(deleteTargetId);
      setShowDeleteDialog(false);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, deleteRule]);

  const handleDuplicate = useCallback((rule: NotificationRuleType) => {
    // ルールの複製処理を実装
    console.log('Duplicate rule:', rule);
  }, []);

  return (
    <Box>
      <List>
        {rules.map((rule) => (
          <Fade in key={rule.id} timeout={300}>
            <ListItem
              sx={{
                borderRadius: 1,
                mb: 1,
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={rule.name}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2" component="span">
                      {rule.days.map(day => 
                        dayOptions.find(opt => opt.value === day)?.label
                      ).join(', ')}
                    </Typography>
                    {rule.categories.map(category => (
                      <Chip
                        key={category}
                        label={categories.find(c => c.id === category)?.name}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    ))}
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="プレビュー" TransitionComponent={Zoom}>
                    <IconButton
                      edge="end"
                      onClick={() => handlePreview(rule.id)}
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="編集" TransitionComponent={Zoom}>
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(rule)}
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="複製" TransitionComponent={Zoom}>
                    <IconButton
                      edge="end"
                      onClick={() => handleDuplicate(rule)}
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="削除" TransitionComponent={Zoom}>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(rule.id)}
                      sx={{
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          </Fade>
        ))}
      </List>

      {/* プレビューダイアログ */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ルールプレビュー</DialogTitle>
        <DialogContent>
          {selectedRule && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {rules.find(r => r.id === selectedRule)?.name}
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    通知日
                  </Typography>
                  <Typography>
                    {rules.find(r => r.id === selectedRule)?.days.map(day => 
                      dayOptions.find(opt => opt.value === day)?.label
                    ).join(', ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    カテゴリ
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {rules.find(r => r.id === selectedRule)?.categories.map(category => (
                      <Chip
                        key={category}
                        label={categories.find(c => c.id === category)?.name}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    優先度
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {rules.find(r => r.id === selectedRule)?.priorities.map(priority => (
                      <Chip
                        key={priority}
                        label={priorityOptions.find(opt => opt.value === priority)?.label}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>ルールの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このルールを削除してもよろしいですか？
            この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            キャンセル
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editTarget ? 'ルールの編集' : '新しいルール'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="ルール名"
              fullWidth
              value={editTarget?.name || ''}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editTarget?.enabled ?? true}
                />
              }
              label="ルールを有効にする"
            />
            <FormControl fullWidth>
              <InputLabel id="days-label">通知日</InputLabel>
              <Select
                labelId="days-label"
                multiple
                value={editTarget?.days || []}
                input={<OutlinedInput label="通知日" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={dayOptions.find(opt => opt.value === value)?.label}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {dayOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="categories-label">カテゴリ</InputLabel>
              <Select
                labelId="categories-label"
                multiple
                value={editTarget?.categories || []}
                input={<OutlinedInput label="カテゴリ" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={categories.find(c => c.id === value)?.name}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="priorities-label">優先度</InputLabel>
              <Select
                labelId="priorities-label"
                multiple
                value={editTarget?.priorities || []}
                input={<OutlinedInput label="優先度" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={priorityOptions.find(opt => opt.value === value)?.label}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setEditDialogOpen(false)}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(NotificationRule); 