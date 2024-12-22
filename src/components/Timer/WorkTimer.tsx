import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Add,
  Remove,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const WorkTimer = () => {
  const [time, setTime] = useState(25 * 60); // 25分をデフォルト
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: number;

    if (isRunning && !isPaused && time > 0) {
      interval = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            notifyTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, time]);

  const notifyTimerComplete = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('タイマー終了', {
        body: '設定した作業時間が経過しました',
        icon: '/favicon.ico'
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsRunning(true);
    setIsPaused(false);
    setInitialTime(time);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(25 * 60);
    setInitialTime(25 * 60);
  };

  const adjustTime = (minutes: number) => {
    setTime((prevTime) => {
      const newTime = prevTime + (minutes * 60);
      const adjustedTime = Math.max(60, Math.min(newTime, 60 * 60));
      setInitialTime(adjustedTime);
      return adjustedTime;
    });
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ maxWidth: 400, margin: 'auto' }}>
        <CardContent>
          <Typography variant="h4" component="div" align="center" gutterBottom>
            作業タイマー
          </Typography>
          
          <Box sx={{ position: 'relative', my: 4 }}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton 
                onClick={() => adjustTime(-5)} 
                disabled={isRunning}
                sx={{ 
                  opacity: isRunning ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                <Remove />
              </IconButton>
              <Typography 
                variant="h2" 
                component={motion.div}
                sx={{ 
                  mx: 3,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: isRunning ? 'primary.main' : 'text.primary'
                }}
                animate={{
                  scale: isPaused ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 0.5,
                  repeat: isPaused ? Infinity : 0
                }}
              >
                {formatTime(time)}
              </Typography>
              <IconButton 
                onClick={() => adjustTime(5)} 
                disabled={isRunning}
                sx={{ 
                  opacity: isRunning ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                <Add />
              </IconButton>
            </Box>
            <Box sx={{ mt: 2, mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isRunning ? (isPaused ? 'paused' : 'running') : 'stopped'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                  onClick={handleStart}
                  disabled={isRunning && !isPaused}
                  sx={{ minWidth: 100 }}
                >
                  開始
                </Button>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={isPaused ? 'resume' : 'pause'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={isPaused ? <PlayArrow /> : <Pause />}
                  onClick={handlePause}
                  disabled={!isRunning}
                  sx={{ minWidth: 100 }}
                >
                  {isPaused ? '再開' : '一時停止'}
                </Button>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={handleStop}
              disabled={!isRunning && time === 25 * 60}
              sx={{ minWidth: 100 }}
            >
              停止
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkTimer; 