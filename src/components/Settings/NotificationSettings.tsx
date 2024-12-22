import React, { memo, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Stack,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';
import NotificationRule from './NotificationRule';
import NotificationTemplate from './NotificationTemplate';

const NotificationSettings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    notificationEnabled,
    notificationSound,
    notificationVolume,
    setNotificationEnabled,
    setNotificationSound,
    setNotificationVolume,
  } = useStore();

  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState<number>(70);

  const handleVolumeChange = useCallback((_: Event, newValue: number | number[]) => {
    setNotificationVolume(newValue as number);
  }, [setNotificationVolume]);

  const toggleSound = useCallback(() => {
    if (notificationSound) {
      setVolumeBeforeMute(notificationVolume);
      setNotificationVolume(0);
    } else {
      setNotificationVolume(volumeBeforeMute);
    }
    setNotificationSound(!notificationSound);
  }, [notificationSound, notificationVolume, volumeBeforeMute, setNotificationSound, setNotificationVolume]);

  const handleSectionHover = useCallback((section: string | null) => {
    setActiveSection(section);
  }, []);

  const handleHelpClick = useCallback(() => {
    setShowHelpDialog(true);
  }, []);

  return (
    <Fade in timeout={500}>
      <Box>
        <Stack spacing={isMobile ? 2 : 3}>
          <Box
            onMouseEnter={() => handleSectionHover('basic')}
            onMouseLeave={() => handleSectionHover(null)}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: activeSection === 'basic' ? 'action.hover' : 'transparent',
              transition: 'background-color 0.3s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3">
                基本設定
              </Typography>
              <Tooltip title="通知の基本設定を行います" TransitionComponent={Zoom}>
                <IconButton size="small" sx={{ ml: 1 }} onClick={handleHelpClick}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationEnabled}
                  onChange={(e) => setNotificationEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="通知を有効にする"
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mt: 2,
                opacity: notificationEnabled ? 1 : 0.5,
                pointerEvents: notificationEnabled ? 'auto' : 'none',
                transition: 'opacity 0.3s ease',
              }}
            >
              <Tooltip
                title={notificationSound ? '通知音をミュート' : '通知音を有効化'}
                TransitionComponent={Zoom}
              >
                <IconButton
                  onClick={toggleSound}
                  color={notificationSound ? 'primary' : 'default'}
                  sx={{
                    p: 1,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {notificationSound ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
              </Tooltip>

              <Slider
                value={notificationVolume}
                onChange={handleVolumeChange}
                aria-label="音量"
                valueLabelDisplay="auto"
                min={0}
                max={100}
                sx={{
                  flexGrow: 1,
                  '& .MuiSlider-thumb': {
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.2)',
                    },
                  },
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 40 }}
              >
                {notificationVolume}%
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              opacity: notificationEnabled ? 1 : 0.5,
              pointerEvents: notificationEnabled ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          >
            <Box
              onMouseEnter={() => handleSectionHover('template')}
              onMouseLeave={() => handleSectionHover(null)}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: activeSection === 'template' ? 'action.hover' : 'transparent',
                transition: 'background-color 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  通知テンプレート
                </Typography>
                <Tooltip title="通知の表示形式を設定します" TransitionComponent={Zoom}>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="新しいテンプレートを追加" TransitionComponent={Zoom}>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      ml: 'auto',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    テンプレートを追加
                  </Button>
                </Tooltip>
              </Box>
              <NotificationTemplate />
            </Box>
          </Box>

          <Box
            sx={{
              opacity: notificationEnabled ? 1 : 0.5,
              pointerEvents: notificationEnabled ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          >
            <Box
              onMouseEnter={() => handleSectionHover('rule')}
              onMouseLeave={() => handleSectionHover(null)}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: activeSection === 'rule' ? 'action.hover' : 'transparent',
                transition: 'background-color 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  通知ルール
                </Typography>
                <Tooltip title="通知を送信する条件を設定します" TransitionComponent={Zoom}>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="新しいルールを追加" TransitionComponent={Zoom}>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      ml: 'auto',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    ルールを追加
                  </Button>
                </Tooltip>
              </Box>
              <NotificationRule />
            </Box>
          </Box>
        </Stack>

        <Dialog
          open={showHelpDialog}
          onClose={() => setShowHelpDialog(false)}
          aria-labelledby="help-dialog-title"
          aria-describedby="help-dialog-description"
        >
          <DialogTitle id="help-dialog-title">
            通知設定のヘルプ
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="help-dialog-description">
              <Typography variant="h6" gutterBottom>基本設定</Typography>
              <Typography paragraph>
                通知の有効/無効の切り替えや、通知音の設定を行います。
                スライダーで通知音量を調整できます。
              </Typography>

              <Typography variant="h6" gutterBottom>通知テンプレート</Typography>
              <Typography paragraph>
                通知の表示形式をカスタマイズできます。
                テンプレートには通知のタイトル、メッセージ、アクションを設定できます。
              </Typography>

              <Typography variant="h6" gutterBottom>通知ルール</Typography>
              <Typography paragraph>
                通知を送信する条件を設定します。
                時間帯、優先度、カテゴリなどの条件を組み合わせて、
                柔軟な通知ルールを作成できます。
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHelpDialog(false)} color="primary">
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default memo(NotificationSettings); 