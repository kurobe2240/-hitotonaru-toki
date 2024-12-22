import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
} from '@mui/material';
import { TimerPreset } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (preset: Omit<TimerPreset, 'id'>) => void;
  preset: TimerPreset | null | undefined;
}

const TimerPresetDialog: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  preset,
}) => {
  const [formData, setFormData] = useState<Omit<TimerPreset, 'id'>>({
    name: '',
    duration: 1500, // 25分
    breakDuration: 300, // 5分
    longBreakDuration: 900, // 15分
    autoStartBreak: true,
    autoStartNextSession: false,
    sessionsUntilLongBreak: 4,
  });

  useEffect(() => {
    if (preset) {
      setFormData(preset);
    }
  }, [preset]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const handleDurationChange = (
    field: keyof Pick<TimerPreset, 'duration' | 'breakDuration' | 'longBreakDuration'>,
    minutes: string
  ) => {
    const value = parseInt(minutes);
    if (!isNaN(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value * 60, // 分を秒に変換
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {preset ? 'プリセットを編集' : 'プリセットを作成'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            label="名前"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              時間設定
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="作業時間（分）"
                type="number"
                value={formData.duration / 60}
                onChange={(e) => handleDurationChange('duration', e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />

              <TextField
                label="休憩時間（分）"
                type="number"
                value={formData.breakDuration / 60}
                onChange={(e) => handleDurationChange('breakDuration', e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />

              <TextField
                label="長い休憩時間（分）"
                type="number"
                value={formData.longBreakDuration / 60}
                onChange={(e) => handleDurationChange('longBreakDuration', e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />

              <TextField
                label="長い休憩までのセッション数"
                type="number"
                value={formData.sessionsUntilLongBreak}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    setFormData({ ...formData, sessionsUntilLongBreak: value });
                  }
                }}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              自動���設定
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoStartBreak}
                    onChange={(e) =>
                      setFormData({ ...formData, autoStartBreak: e.target.checked })
                    }
                  />
                }
                label="作業終了後に自動で休憩を開始"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoStartNextSession}
                    onChange={(e) =>
                      setFormData({ ...formData, autoStartNextSession: e.target.checked })
                    }
                  />
                }
                label="休憩終了後に自動で次のセッションを開始"
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!formData.name || formData.duration <= 0}
        >
          {preset ? '更新' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimerPresetDialog; 