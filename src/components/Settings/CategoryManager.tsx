import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Category } from '../../types';

interface Props {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

export const CategoryManager: React.FC<Props> = ({
  categories,
  onCategoriesChange,
}) => {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1976d2');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setName('');
    setColor('#1976d2');
    setShowColorPicker(false);
    setOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setShowColorPicker(false);
    setOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const newCategories = categories.filter((c) => c.id !== categoryId);
    onCategoriesChange(newCategories);
  };

  const handleSaveCategory = () => {
    if (!name) return;

    const newCategory: Category = {
      id: editingCategory?.id || `category-${Date.now()}`,
      name,
      color,
      order: editingCategory?.order ?? categories.length,
    };

    const newCategories = editingCategory
      ? categories.map((c) => (c.id === editingCategory.id ? newCategory : c))
      : [...categories, newCategory];

    onCategoriesChange(newCategories);
    setOpen(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 並び順を更新
    const updatedCategories = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    onCategoriesChange(updatedCategories);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">カテゴリ管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCategory}>
          新規カテゴリ
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {categories
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((category, index) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id}
                    index={index}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 2,
                            cursor: 'grab',
                          }}
                        >
                          <DragIndicatorIcon />
                        </Box>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: category.color,
                            mr: 2,
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">{category.name}</Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleEditCategory(category)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'カテゴリを編集' : '新規カテゴリ'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="カテゴリ名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                カラー
              </Typography>
              <Box
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{
                  width: '100%',
                  height: 40,
                  backgroundColor: color,
                  cursor: 'pointer',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              {showColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                  <Box
                    sx={{
                      position: 'fixed',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                    }}
                    onClick={() => setShowColorPicker(false)}
                  />
                  <ChromePicker
                    color={color}
                    onChange={(color) => setColor(color.hex)}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 