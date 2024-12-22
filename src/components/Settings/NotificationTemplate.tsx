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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';

const NotificationTemplate: React.FC = () => {
  const { templates, deleteTemplate } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);

  const handlePreview = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setShowPreview(true);
  }, []);

  const handleEdit = useCallback((template: any) => {
    setEditTarget(template);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((templateId: string) => {
    setDeleteTargetId(templateId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteTemplate(deleteTargetId);
      setShowDeleteDialog(false);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, deleteTemplate]);

  const handleDuplicate = useCallback((template: any) => {
    // テンプレートの複製処理を実装
    console.log('Duplicate template:', template);
  }, []);

  return (
    <Box>
      <List>
        {templates.map((template) => (
          <Fade in key={template.id} timeout={300}>
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
                primary={template.name}
                secondary={template.description}
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="プレビュー" TransitionComponent={Zoom}>
                    <IconButton
                      edge="end"
                      onClick={() => handlePreview(template.id)}
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
                      onClick={() => handleEdit(template)}
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
                      onClick={() => handleDuplicate(template)}
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
                      onClick={() => handleDelete(template.id)}
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
        <DialogTitle>テンプレートプレビュー</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {templates.find(t => t.id === selectedTemplate)?.name}
              </Typography>
              <Typography>
                {templates.find(t => t.id === selectedTemplate)?.description}
              </Typography>
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
        <DialogTitle>テンプレートの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このテンプレートを削除してもよろしいですか？
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
          {editTarget ? 'テンプレートの編集' : '新しいテンプレート'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="テンプレート名"
              fullWidth
              value={editTarget?.name || ''}
            />
            <TextField
              label="説明"
              fullWidth
              multiline
              rows={3}
              value={editTarget?.description || ''}
            />
            <TextField
              select
              label="通知タイプ"
              fullWidth
              value={editTarget?.type || 'basic'}
            >
              <MenuItem value="basic">基本</MenuItem>
              <MenuItem value="success">成功</MenuItem>
              <MenuItem value="warning">警告</MenuItem>
              <MenuItem value="error">エラー</MenuItem>
            </TextField>
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

export default memo(NotificationTemplate); 