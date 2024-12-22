import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Alert,
  Snackbar,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  NotificationSchedule as INotificationSchedule,
  NotificationTemplate,
  Category,
  DayOfWeek,
} from '../../types';
import ErrorBoundary from '../ErrorBoundary';

interface Props {
  value: INotificationSchedule;
  onChange: (schedule: INotificationSchedule) => void;
  categories: Category[];
  type: 'timer' | 'task';
  templates: NotificationTemplate[];
  availableSounds: string[];
}

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: 'sun', label: '日曜日' },
  { value: 'mon', label: '月曜日' },
  { value: 'tue', label: '火曜日' },
  { value: 'wed', label: '水曜日' },
  { value: 'thu', label: '木曜日' },
  { value: 'fri', label: '金曜日' },
  { value: 'sat', label: '土曜日' },
];

const priorityOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const ScheduleSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = React.memo(({ title, children }) => (
  <Box sx={{ mb: 3 }} role="region" aria-label={title}>
    <Typography variant="subtitle1" gutterBottom component="h3">
      {title}
    </Typography>
    {children}
  </Box>
));

export const NotificationSchedule: React.FC<Props> = React.memo(({
  value,
  onChange,
  categories,
  type,
  templates,
  availableSounds,
}) => {
  const [name, setName] = useState(value.name || '');
  const [enabled, setEnabled] = useState(value.enabled);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(value.days || []);
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>(
    value.timeRange || { start: '00:00', end: '23:59' }
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(value.categories || []);
  const [selectedPriorities, setSelectedPriorities] = useState<('high' | 'medium' | 'low')[]>(value.priorities || []);
  const [customMessage, setCustomMessage] = useState(value.customMessage || '');
  const [sound, setSound] = useState(value.sound || '');
  const [template, setTemplate] = useState(value.template || '');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(() => {
    try {
      if (!name) {
        throw new Error('スケジュール名を入力してください');
      }
      if (selectedDays.length === 0) {
        throw new Error('曜日を選択してください');
      }
      if (!timeRange.start || !timeRange.end) {
        throw new Error('時間範囲を設定してください');
      }

      onChange({
        id: value.id,
        name,
        enabled,
        type,
        days: selectedDays,
        timeRange,
        categories: selectedCategories,
        priorities: selectedPriorities,
        customMessage,
        sound,
        template,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  }, [
    name,
    enabled,
    type,
    selectedDays,
    timeRange,
    selectedCategories,
    selectedPriorities,
    customMessage,
    sound,
    template,
    value.id,
    onChange,
  ]);

  useEffect(() => {
    handleChange();
  }, [handleChange]);

  const handleTimeChange = useCallback((field: 'start' | 'end', value: string) => {
    setTimeRange((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDaysChange = useCallback((event: SelectChangeEvent<DayOfWeek[]>) => {
    setSelectedDays(event.target.value as DayOfWeek[]);
  }, []);

  const handleCategoriesChange = useCallback((event: SelectChangeEvent<string[]>) => {
    setSelectedCategories(event.target.value as string[]);
  }, []);

  const handlePrioritiesChange = useCallback((event: SelectChangeEvent<('high' | 'medium' | 'low')[]>) => {
    setSelectedPriorities(event.target.value as ('high' | 'medium' | 'low')[]);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => t.id.startsWith(type));
  }, [templates, type]);

  return (
    <ErrorBoundary>
      <Box role="form" aria-label="通知スケジュール設定">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">通知スケジュール</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ScheduleSection title="基本設定">
              <TextField
                fullWidth
                label="スケジュール名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                error={!name}
                helperText={!name ? 'スケジュール名は必須です' : ''}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                }
                label="有効"
              />
            </ScheduleSection>
          </Grid>

          <Grid item xs={12}>
            <ScheduleSection title="スケジュール">
              <FormControl fullWidth required error={selectedDays.length === 0}>
                <InputLabel id="days-label">曜日</InputLabel>
                <Select
                  labelId="days-label"
                  multiple
                  value={selectedDays}
                  onChange={handleDaysChange}
                  label="曜日"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={dayOptions.find((d) => d.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {dayOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="開始時刻"
                  type="time"
                  value={timeRange.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  required
                  error={!timeRange.start}
                />
                <TextField
                  fullWidth
                  label="終了時刻"
                  type="time"
                  value={timeRange.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  required
                  error={!timeRange.end}
                />
              </Box>
            </ScheduleSection>
          </Grid>

          <Grid item xs={12}>
            <ScheduleSection title="フィルター">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="categories-label">カテゴリ</InputLabel>
                    <Select
                      labelId="categories-label"
                      multiple
                      value={selectedCategories}
                      onChange={handleCategoriesChange}
                      label="カテゴリ"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={categories.find((c) => c.id === value)?.name || value}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="priorities-label">優先度</InputLabel>
                    <Select
                      labelId="priorities-label"
                      multiple
                      value={selectedPriorities}
                      onChange={handlePrioritiesChange}
                      label="優先度"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={priorityOptions.find((p) => p.value === value)?.label || value}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {priorityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </ScheduleSection>
          </Grid>

          <Grid item xs={12}>
            <ScheduleSection title="通知設定">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="カスタムメッセージ"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="sound-label">通知音</InputLabel>
                    <Select
                      labelId="sound-label"
                      value={sound}
                      onChange={(e) => setSound(e.target.value)}
                      label="通知音"
                    >
                      <MenuItem value="">
                        <em>デフォルト</em>
                      </MenuItem>
                      {availableSounds.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="template-label">テンプレート</InputLabel>
                    <Select
                      labelId="template-label"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      label="テンプレート"
                    >
                      <MenuItem value="">
                        <em>デフォルト</em>
                      </MenuItem>
                      {filteredTemplates.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </ScheduleSection>
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
});

NotificationSchedule.displayName = 'NotificationSchedule';

export default NotificationSchedule; 