import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
  Chip,
  Fade,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  SkipNext,
  Settings,
  Add,
  Timer as TimerIcon,
  Coffee,
  LocalCafe,
  Delete,
} from '@mui/icons-material';
import useStore from '../../store/useStore';
import { TimerPreset } from '../../types';
import TimerPresetDialog from './TimerPresetDialog';

const TimerView: React.FC = () => {
  const {
    timerPresets,
    timerSessions,
    addTimerSession,
    addTimerPreset,
    updateTimerPreset,
    deleteTimerPreset,
    startBreak,
    endBreak,
    startLongBreak,
    endLongBreak,
    pauseSession,
    resumeSession,
    completeSession,
  } = useStore();

  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(
    timerPresets[0] || null
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionType, setSessionType] = useState<'work' | 'break' | 'long-break'>('work');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // タイマーの表示形式を整形
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  // プログレスバーの進捗率を計算
  const calculateProgress = useCallback(() => {
    if (!selectedPreset) return 0;
    const totalTime = sessionType === 'work' 
      ? selectedPreset.duration 
      : sessionType === 'break' 
        ? selectedPreset.breakDuration 
        : selectedPreset.longBreakDuration;
    return ((totalTime - timeLeft) / totalTime) * 100;
  }, [selectedPreset, timeLeft, sessionType]);

  // タイマーの開始
  const startTimer = useCallback(() => {
    if (!selectedPreset || isRunning) return;

    const session = {
      presetId: selectedPreset.id,
      startTime: new Date(),
      endTime: new Date(),
      duration: selectedPreset.duration,
      completed: false,
      type: 'work' as const,
      sessionCount: sessionCount,
      interruptions: [],
    };

    addTimerSession(session);
    setCurrentSession(session.presetId);
    setTimeLeft(selectedPreset.duration);
    setIsRunning(true);
    setSessionType('work');
    setShowAlert(true);
    setAlertMessage('作業を開始しました');
  }, [selectedPreset, isRunning, addTimerSession, sessionCount]);

  // タイマーの一時停止
  const handlePause = useCallback(() => {
    if (!currentSession) return;
    pauseSession(currentSession);
    setIsRunning(false);
    setShowPauseDialog(true);
  }, [currentSession, pauseSession]);

  // タイマーの再開
  const handleResume = useCallback(() => {
    if (!currentSession) return;
    resumeSession(currentSession);
    setIsRunning(true);
    setShowAlert(true);
    setAlertMessage('タイマーを再開しました');
  }, [currentSession, resumeSession]);

  // タイマーの停止
  const handleStop = useCallback(() => {
    if (!currentSession) return;
    completeSession(currentSession);
    setIsRunning(false);
    setCurrentSession(null);
    if (selectedPreset) {
      setTimeLeft(selectedPreset.duration);
    }
    setSessionType('work');
    setShowAlert(true);
    setAlertMessage('タイマーを停止しました');
  }, [currentSession, completeSession, selectedPreset]);

  // 休憩の開始
  const handleStartBreak = useCallback(() => {
    if (!currentSession || !selectedPreset) return;
    startBreak(currentSession);
    setTimeLeft(selectedPreset.breakDuration);
    setIsRunning(true);
    setSessionType('break');
    setShowAlert(true);
    setAlertMessage('休憩を開始しました');
  }, [currentSession, selectedPreset, startBreak]);

  // 長い休憩の開始
  const handleStartLongBreak = useCallback(() => {
    if (!currentSession || !selectedPreset) return;
    startLongBreak(currentSession);
    setTimeLeft(selectedPreset.longBreakDuration);
    setIsRunning(true);
    setSessionType('long-break');
    setSessionCount(0); // 長い休憩後はセッションカウントをリセット
    setShowAlert(true);
    setAlertMessage('長い休憩を開始しました');
  }, [currentSession, selectedPreset, startLongBreak]);

  // タイマーの更新
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (currentSession) {
              completeSession(currentSession);
              if (sessionType === 'work') {
                if (selectedPreset?.autoStartBreak) {
                  // セッション数をチェックして適切な休憩を開始
                  const newSessionCount = sessionCount + 1;
                  if (newSessionCount >= (selectedPreset?.sessionsUntilLongBreak || 4)) {
                    handleStartLongBreak();
                  } else {
                    setSessionCount(newSessionCount);
                    handleStartBreak();
                  }
                } else {
                  setShowAlert(true);
                  setAlertMessage('作業が完了しました。休憩を開始しますか？');
                }
              } else if (sessionType === 'break' || sessionType === 'long-break') {
                if (selectedPreset?.autoStartNextSession) {
                  startTimer();
                } else {
                  setShowAlert(true);
                  setAlertMessage('休憩が完了しました。次のセッションを開始しますか？');
                }
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isRunning,
    timeLeft,
    currentSession,
    completeSession,
    selectedPreset,
    handleStartBreak,
    handleStartLongBreak,
    sessionCount,
    sessionType,
    startTimer,
  ]);

  const handleEditPreset = (preset: TimerPreset) => {
    setEditingPreset(preset);
    setShowPresetDialog(true);
  };

  const handleSavePreset = (preset: Omit<TimerPreset, 'id'>) => {
    if (editingPreset) {
      updateTimerPreset(editingPreset.id, preset);
      setShowAlert(true);
      setAlertMessage('プリセットを更新しました');
    } else {
      addTimerPreset(preset);
      setShowAlert(true);
      setAlertMessage('プリセットを作成しました');
    }
    setShowPresetDialog(false);
    setEditingPreset(null);
  };

  const handleDeletePreset = (id: string) => {
    if (id === 'default') return; // デフォルトプリセットは削除不可
    deleteTimerPreset(id);
    if (selectedPreset?.id === id) {
      setSelectedPreset(timerPresets[0]);
      setTimeLeft(timerPresets[0].duration);
    }
    setShowAlert(true);
    setAlertMessage('プリセットを削除しました');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item container justifyContent="center" spacing={2}>
            <Grid item>
              <Chip
                icon={<TimerIcon />}
                label={`セッション ${sessionCount + 1}`}
                color="primary"
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Chip
                icon={sessionType === 'work' ? <TimerIcon /> : sessionType === 'break' ? <Coffee /> : <LocalCafe />}
                label={sessionType === 'work' ? '作業中' : sessionType === 'break' ? '休憩中' : '長い休憩中'}
                color={sessionType === 'work' ? 'primary' : 'secondary'}
              />
            </Grid>
          </Grid>

          <Grid item sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={calculateProgress()}
              sx={{
                height: 10,
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 1s linear',
                },
              }}
            />
          </Grid>

          <Grid item>
            <Typography variant="h2" component="div">
              {formatTime(timeLeft)}
            </Typography>
          </Grid>

          <Grid item>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>プリセット</InputLabel>
              <Select
                value={selectedPreset?.id || ''}
                onChange={(e) => {
                  const preset = timerPresets.find((p) => p.id === e.target.value);
                  setSelectedPreset(preset || null);
                  if (preset) {
                    setTimeLeft(preset.duration);
                  }
                }}
                disabled={isRunning}
              >
                {timerPresets.map((preset) => (
                  <MenuItem
                    key={preset.id}
                    value={preset.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography>{preset.name}</Typography>
                    {preset.id !== 'default' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPreset(preset);
                          }}
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(preset.id);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isRunning ? (
                <Tooltip title="開始">
                  <IconButton
                    color="primary"
                    onClick={startTimer}
                    disabled={!selectedPreset}
                    size="large"
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="一時停止">
                  <IconButton
                    color="primary"
                    onClick={handlePause}
                    size="large"
                  >
                    <Pause />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="停止">
                <IconButton
                  color="error"
                  onClick={handleStop}
                  disabled={!isRunning}
                  size="large"
                >
                  <Stop />
                </IconButton>
              </Tooltip>

              {sessionType === 'work' && (
                <Tooltip title="休憩を開始">
                  <IconButton
                    color="secondary"
                    onClick={handleStartBreak}
                    disabled={isRunning || !currentSession}
                    size="large"
                  >
                    <Coffee />
                  </IconButton>
                </Tooltip>
              )}

              {sessionType === 'work' && sessionCount >= (selectedPreset?.sessionsUntilLongBreak || 4) - 1 && (
                <Tooltip title="長い休憩を開始">
                  <IconButton
                    color="secondary"
                    onClick={handleStartLongBreak}
                    disabled={isRunning || !currentSession}
                    size="large"
                  >
                    <LocalCafe />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="プリセットを追加">
                <IconButton
                  onClick={() => setShowPresetDialog(true)}
                  size="large"
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TimerPresetDialog
        open={showPresetDialog}
        onClose={() => {
          setShowPresetDialog(false);
          setEditingPreset(null);
        }}
        onSave={handleSavePreset}
        preset={editingPreset}
      />

      <Dialog
        open={showPauseDialog}
        onClose={() => setShowPauseDialog(false)}
      >
        <DialogTitle>一時停止の理由</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="理由"
            fullWidth
            value={pauseReason}
            onChange={(e) => setPauseReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPauseDialog(false)}>キャンセル</Button>
          <Button
            onClick={() => {
              if (currentSession) {
                pauseSession(currentSession);
                setShowPauseDialog(false);
                setPauseReason('');
              }
            }}
            variant="contained"
            color="primary"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimerView; 