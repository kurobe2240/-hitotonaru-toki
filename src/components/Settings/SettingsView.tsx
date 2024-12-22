import React, { memo, useCallback, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Alert,
  Snackbar,
  Fade,
  Container,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton,
  Zoom,
} from '@mui/material';
import {
  Help as HelpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';
import { CategoryManager } from './CategoryManager';
import NotificationSettings from './NotificationSettings';
import { Category } from '../../types';
import ErrorBoundary from '../ErrorBoundary';

interface StoreState {
  categories: Category[];
  updateCategories: (categories: Category[]) => void;
}

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    設定の読み込み中にエラーが発生しました: {error.message}
  </Alert>
);

const SettingsSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = memo(({ title, description, children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={isHovered ? 6 : 3}
        sx={{
          p: isMobile ? 2 : 3,
          mb: 3,
          transition: 'all 0.3s ease-in-out',
          transform: isHovered ? 'translateY(-2px)' : 'none',
          '&:hover': {
            boxShadow: theme.shadows[6],
          },
        }}
        role="region"
        aria-label={title}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            component="h2"
            sx={{
              fontWeight: 'medium',
              color: theme.palette.primary.main,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Tooltip title={description} placement="top" TransitionComponent={Zoom}>
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </Paper>
    </Fade>
  );
});

SettingsSection.displayName = 'SettingsSection';

const SettingsView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { categories, updateCategories } = useStore<StoreState>();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleCategoriesChange = useCallback((newCategories: Category[]) => {
    try {
      updateCategories(newCategories);
      setFeedbackMessage('カテゴリーを更新しました');
      setShowFeedback(true);
    } catch (error) {
      console.error('カテゴリーの更新中にエラーが発生しました:', error);
      setFeedbackMessage('カテゴリーの更新に失敗しました');
      setShowFeedback(true);
    }
  }, [updateCategories]);

  const handleHelpClick = useCallback(() => {
    setShowHelp(true);
  }, []);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          p: isMobile ? 2 : 3,
          mt: isMobile ? 2 : 4,
        }}
        component="main"
        role="main"
        aria-label="設定ページ"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Fade in timeout={300}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component="h1"
              sx={{
                fontWeight: 'bold',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              設定
            </Typography>
          </Fade>
          <Tooltip title="設定のヘルプ" placement="top" TransitionComponent={Zoom}>
            <IconButton
              onClick={handleHelpClick}
              size={isMobile ? 'small' : 'medium'}
              sx={{ ml: 2 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <ErrorBoundary>
          <SettingsSection
            title="カテゴリー管理"
            description="タスクを整理するためのカテゴリーを管理します"
          >
            <CategoryManager
              categories={categories}
              onCategoriesChange={handleCategoriesChange}
            />
          </SettingsSection>

          <SettingsSection
            title="通知設定"
            description="通知の表示方法やタイミングを設定します"
          >
            <NotificationSettings />
          </SettingsSection>
        </ErrorBoundary>

        <Snackbar
          open={showFeedback}
          autoHideDuration={3000}
          onClose={() => setShowFeedback(false)}
          message={feedbackMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        <Snackbar
          open={showHelp}
          autoHideDuration={5000}
          onClose={() => setShowHelp(false)}
          message="設定画面のヘルプはこちらです。各セクションにカーソルを合わせると詳細が表示されます。"
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </Box>
    </Container>
  );
};

export default memo(SettingsView); 