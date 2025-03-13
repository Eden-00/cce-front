import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LockIcon from '@mui/icons-material/Lock';

import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
       스캔 데이터 분석: 개발 예정
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={4}>
          <Box sx={{ position: 'relative' }}>
            <AnalyticsCurrentVisits
              title="항목별 취약점"
              chart={{
                series: [
                  { label: 'America', value: 3500 },
                  { label: 'Asia', value: 2500 },
                  { label: 'Europe', value: 1500 },
                  { label: 'Africa', value: 500 },
                ],
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <Box sx={{ position: 'relative' }}>
            <AnalyticsWebsiteVisits
              title="자산별 취약점"
              subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                ],
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <Box sx={{ position: 'relative' }}>
            <AnalyticsConversionRates
              title="취약점 통계"
              subheader="(+43%) than last year"
              chart={{
                categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
                series: [
                  { name: '2022', data: [44, 55, 41, 64, 22] },
                  { name: '2023', data: [53, 32, 33, 52, 13] },
                ],
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <Box sx={{ position: 'relative' }}>
            <AnalyticsCurrentSubject
              title="보안 수준"
              chart={{
                categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
                series: [
                  { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                  { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                  { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
                ],
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}