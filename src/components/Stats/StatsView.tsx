import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import useStore from '../../store/useStore';
import { calculateTimerStats, calculateTaskStats } from '../../utils/statsUtils';

// Chart.jsの設定
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatsView = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const { timerSessions, tasks } = useStore();

  const timerStats = calculateTimerStats(timerSessions);
  const taskStats = calculateTaskStats(tasks);

  // タイマー統計のグラフデータ
  const timerChartData = {
    labels: timerStats.lastWeekSessions.map((session) =>
      format(session.date, 'M/d (E)', { locale: ja })
    ),
    datasets: [
      {
        label: '作業時間（分）',
        data: timerStats.lastWeekSessions.map((session) => session.totalTime / 60),
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1,
      },
    ],
  };

  // タスク統計のグラフデータ
  const taskPieData = {
    labels: taskStats.tasksByCategory.map((item) => item.category),
    datasets: [
      {
        data: taskStats.tasksByCategory.map((item) => item.count),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.success.main,
          theme.palette.info.main,
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  const priorityPieData = {
    labels: ['高', '中', '低'].map((priority) => `優先度${priority}`),
    datasets: [
      {
        data: taskStats.tasksByPriority.map((item) => item.count),
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.success.main,
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* タイマー統計 */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" gutterBottom>
              タイマー統計
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  総セッション数
                </Typography>
                <Typography variant="h5">
                  {timerStats.totalSessions}回
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  完了セッション
                </Typography>
                <Typography variant="h5">
                  {timerStats.completedSessions}回
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  総作業時間
                </Typography>
                <Typography variant="h5">
                  {Math.round(timerStats.totalTime / 60)}分
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  平均セッション時間
                </Typography>
                <Typography variant="h5">
                  {Math.round(timerStats.averageSessionTime / 60)}分
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ height: 300 }}>
              <Bar
                data={timerChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* タスク統計 */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" gutterBottom>
              タスク統計
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  総タスク数
                </Typography>
                <Typography variant="h5">{taskStats.totalTasks}個</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  完了タスク
                </Typography>
                <Typography variant="h5">
                  {taskStats.completedTasks}個
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  期限切れタスク
                </Typography>
                <Typography variant="h5">
                  {taskStats.overdueTasks}個
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  カテゴリ別タスク
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie
                    data={taskPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  優先度別タスク
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie
                    data={priorityPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsView; 