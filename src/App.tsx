import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Container, Paper, Tabs, Tab, AppBar, Toolbar, Typography, IconButton, Dialog, DialogContent } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, DarkMode as DarkModeIcon } from '@mui/icons-material'
import PasswordLock from './components/Auth/PasswordLock'
import TimerView from './components/Timer/TimerView'
import TaskReminder from './components/Reminder/TaskReminder'
import CalendarView from './components/Calendar/CalendarView'
import StatsView from './components/Stats/StatsView'
import SettingsView from './components/Settings/SettingsView'
import useStore from './store/useStore'
import { ja } from 'date-fns/locale'

// テーマの設定
const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
  },
});

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openSettings, setOpenSettings] = useState(false);
  const { settings, updateSettings } = useStore();

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'light' ? 'dark' : 'light'
    });
  };

  const theme = getTheme(settings.theme);

  if (isLocked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PasswordLock isOpen={isLocked} onUnlock={handleUnlock} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Health Life Manager
              </Typography>
              <IconButton onClick={toggleTheme} color="inherit">
                <DarkModeIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => setOpenSettings(true)}>
                <SettingsIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ pt: 2, pb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 3,
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  centered
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTab-root': {
                      minWidth: 120,
                      fontSize: '1rem',
                      fontWeight: 500,
                      py: 2,
                    },
                  }}
                >
                  <Tab label="タイマー" />
                  <Tab label="リマインダー" />
                  <Tab label="統計" />
                  <Tab label="カレンダー" />
                </Tabs>
              </Paper>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 0 && <TimerView />}
                  {activeTab === 1 && <TaskReminder />}
                  {activeTab === 2 && <StatsView />}
                  {activeTab === 3 && <CalendarView />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </Container>

          <Dialog
            open={openSettings}
            onClose={() => setOpenSettings(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              <SettingsView />
            </DialogContent>
          </Dialog>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App
