import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AgentDownloadView() {
  return (
    <DashboardContent>
      <Box display="flex" flexDirection="column" alignItems="center" mb={6}>
        <Typography variant="h3" align="center" mb={1}>
          FindtheCCE 에이전트 다운로드
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={3}>
          보안 에이전트 설치 시 입력이 필요한 정보는 <span style={{ color: '#ff5252', fontWeight: 'bold' }}>파인더갭 관리자에게 문의</span>해 주세요.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Windows */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h5" mb={3}>
              Windows
            </Typography>
            
            <Box 
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Iconify icon="mdi:microsoft-windows" width={64} height={64} />
            </Box>
            
            <Typography variant="body2" mb={2} color="text.secondary">
              8 / 8.1 / 10 / 11
            </Typography>
            
            <Stack spacing={2} width="100%" mt="auto">
              <Button 
                variant="contained" 
                fullWidth
                endIcon={<Iconify icon="material-symbols:download" />}
                sx={{ bgcolor: '#222', '&:hover': { bgcolor: '#000' } }}
              >
                다운로드
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                endIcon={<Iconify icon="material-symbols:arrow-forward" />}
                sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                설치 가이드
              </Button>
            </Stack>
          </Card>
        </Grid>
        
        {/* macOS */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h5" mb={3}>
              macOS
            </Typography>
            
            <Box 
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Iconify icon="mdi:apple" width={64} height={64} />
            </Box>
            
            <Typography variant="body2" mb={2} color="text.secondary">
              10.15 / 11 / 12 / 13 / 14 / 15
            </Typography>
            
            <Stack spacing={2} width="100%" mt="auto">
              <Button 
                variant="contained" 
                fullWidth
                endIcon={<Iconify icon="material-symbols:download" />}
                sx={{ bgcolor: '#222', '&:hover': { bgcolor: '#000' } }}
              >
                다운로드
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                endIcon={<Iconify icon="material-symbols:arrow-forward" />}
                sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                설치 가이드
              </Button>
            </Stack>
          </Card>
        </Grid>
        
        {/* Linux */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h5" mb={3}>
              Linux
            </Typography>
            
            <Box 
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Iconify icon="mdi:linux" width={64} height={64} />
            </Box>
            
            <Typography variant="body2" mb={2} color="text.secondary">
              Ubuntu / CentOS / RHEL / Debian
            </Typography>
            
            <Stack spacing={2} width="100%" mt="auto">
              <Button 
                variant="contained" 
                fullWidth
                endIcon={<Iconify icon="material-symbols:download" />}
                sx={{ bgcolor: '#222', '&:hover': { bgcolor: '#000' } }}
              >
                다운로드
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                endIcon={<Iconify icon="material-symbols:arrow-forward" />}
                sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                설치 가이드
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}