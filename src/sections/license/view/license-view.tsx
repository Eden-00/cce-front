import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

// Sample data for the license
const LICENSE_SAMPLE_DATA = {
  status: 'active', // 'active', 'expired', 'pending'
  activationDate: '2025-01-15T09:00:00',
  expirationDate: '2025-04-15T09:00:00',
  licenseKey: 'FTGAP-12345-ABCDE-67890',
  licensedTo: 'Paradox Inc.',
  email: 'paradox@findthegap.co.kr',
  maxAgents: 10,
  activeAgents: 5,
  features: ['Basic Analysis', 'Result Data Export(XML)', 'API Access'],
};

// ----------------------------------------------------------------------

export function LicenseView() {
  const [loading, setLoading] = useState(false);
  const [licenseData, setLicenseData] = useState(LICENSE_SAMPLE_DATA);

  // Simulate loading data
  const handleRefresh = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLicenseData(LICENSE_SAMPLE_DATA);
      setLoading(false);
    }, 1000);
  };

  // Calculate remaining days
  const calculateRemainingDays = () => {
    const expirationDate = new Date(licenseData.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status text in Korean
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성화';
      case 'expired':
        return '만료됨';
      case 'pending':
        return '대기중';
      default:
        return status;
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          License
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:refresh" />}
          sx={{ mr: 1 }}
          disabled={loading}
          onClick={handleRefresh}
        >
          새로고침
        </Button>
      </Box>

      <Card>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box p={3}>
            <Box display="flex" alignItems="center" mb={3}>
                <Typography variant="h6" flexGrow={1}>
                  라이센스 정보
                </Typography>
                <Chip
                  label={getStatusText(licenseData.status)}
                  color={getStatusColor(licenseData.status) as any}
                  size="medium"
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    py: 1,
                    px: 2,
                    height: 'auto'
                  }}
                />
              </Box>
              
              <Scrollbar>
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: '30%', fontWeight: 'bold' }}>라이센스 키</TableCell>
                        <TableCell>{licenseData.licenseKey}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>라이센스 사용자</TableCell>
                        <TableCell>{licenseData.licensedTo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>이메일</TableCell>
                        <TableCell>{licenseData.email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>활성화 날짜</TableCell>
                        <TableCell>{formatDate(licenseData.activationDate)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>만료 날짜</TableCell>
                        <TableCell>{formatDate(licenseData.expirationDate)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>남은 기간</TableCell>
                        <TableCell>{calculateRemainingDays()}일</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>최대 에이전트 수</TableCell>
                        <TableCell>{licenseData.maxAgents} 개</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>활성 에이전트 수</TableCell>
                        <TableCell>{licenseData.activeAgents} 개</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>포함된 기능</TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {licenseData.features.map((feature, index) => (
                              <Chip key={index} label={feature} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Scrollbar>
            </Box>
            
            <Divider />
            
            <Box p={3}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Activation이 종료되면 한달간 데이터를 보관 후 삭제됩니다.
                </Typography>
              </Alert>
              <Alert severity="warning">
                <Typography variant="body2">
                  Activation 기간을 늘리고 싶다면 파인더갭 관리자에게 연락하세요:
                  <br />
                  <strong>support@findthegap.co.kr</strong>
                </Typography>
              </Alert>
            </Box>
          </>
        )}
      </Card>
    </DashboardContent>
  );
}