import { useState, SyntheticEvent } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`os-tabpanel-${index}`}
      aria-labelledby={`os-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 코드 블록 컴포넌트
interface CodeBlockProps {
  code: string;
  onCopy?: () => void;
}

function CodeBlock({ code, onCopy }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'grey.900',
          borderRadius: 1,
          p: 2,
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: 'common.white',
          overflowX: 'auto'
        }}
      >
        <pre style={{ margin: 0 }}><code>{code}</code></pre>
      </Paper>
      <Tooltip title={copied ? "복사됨!" : "클립보드에 복사"}>
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'grey.500',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            }
          }}
        >
          <Iconify icon={copied ? "mdi:check" : "mdi:content-copy"} width={16} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// 각 OS 섹션의 다운로드 바로가기 컴포넌트
interface DownloadSectionProps {
  title: string;
  description: string;
  icon: string;
  onDownload: () => void;
  onGuide: () => void;
}

function DownloadSection({ title, description, icon, onDownload, onGuide }: DownloadSectionProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 4 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        textAlign: { xs: 'center', sm: 'left' },
        flex: 1,
        mb: { xs: 3, sm: 0 }
      }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: { xs: 0, sm: 3 },
            mb: { xs: 2, sm: 0 }
          }}
        >
          <Iconify icon={icon} width={40} height={40} />
        </Box>
        <Box>
          <Typography variant="h5" mb={1}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { xs: '100%', sm: '320px' } }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Iconify icon="material-symbols:download" />}
          onClick={onDownload}
          sx={{ bgcolor: '#222', '&:hover': { bgcolor: '#000' } }}
        >
          다운로드
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<Iconify icon="material-symbols:arrow-forward" />}
          onClick={onGuide}
          sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' } }}
        >
          설치 가이드
        </Button>
      </Stack>
    </Box>
  );
}

export function AgentDownloadView() {
  const [osTab, setOsTab] = useState(0);
  // Linux CLI 탭을 기본값(1)으로 설정
  const [linuxInstallTab, setLinuxInstallTab] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const handleOsTabChange = (event: SyntheticEvent, newValue: number) => {
    setOsTab(newValue);
  };

  const handleLinuxInstallTabChange = (event: SyntheticEvent, newValue: number) => {
    setLinuxInstallTab(newValue);
  };

  const handleDownload = (os: string) => {
    try {
      // 다운로드 URL 생성
      const downloadBaseUrl = 'https://13.125.36.244:18586/api/download-agent';
      const downloadUrl = `${downloadBaseUrl}?os=${os}`;
  
      // OS별 다운로드 처리
      switch (os.toLowerCase()) {
        case 'mac':
          // macOS 다운로드 처리
          fetch(downloadUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Download failed');
              }
              return response.blob();
            })
            .then(blob => {
              // Blob을 다운로드 가능한 링크로 변환
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = 'AgentInstaller_Mac.dmg'; // macOS용 확장자
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            })
            .catch(error => {
              console.error('Mac download error:', error);
              alert('Mac 에이전트 다운로드에 실패했습니다.');
            });
          break;
  
        case 'windows':
          // Windows 다운로드 처리
          fetch(downloadUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Download failed');
              }
              return response.blob();
            })
            .then(blob => {
              // Blob을 다운로드 가능한 링크로 변환
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = 'AgentInstaller_Windows.exe'; // Windows용 확장자
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            })
            .catch(error => {
              console.error('Windows download error:', error);
              alert('Windows 에이전트 다운로드에 실패했습니다.');
            });
          break;
  
        default:
          alert('지원되지 않는 운영 체제입니다.');
          console.error(`Unsupported OS: ${os}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('에이전트 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleGuide = (os: string) => {
    console.log(`Opening guide for ${os}`);
    // 설치 가이드 페이지로 이동 또는 모달 열기
  };

  const handleCopySuccess = () => {
    setSnackbar({
      open: true,
      message: '명령어가 클립보드에 복사되었습니다.',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // CLI 설치 코드
  const ubuntuInstallCode = 'curl "http://13.125.36.244:5000/download-agent?os=linux" --output FTC_Agent.zip';

  return (
    <DashboardContent>
      <Box display="flex" flexDirection="column" alignItems="center" mb={5}>
        <Typography variant="h3" align="center" mb={1}>
          FindtheCCE 에이전트 다운로드
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" mb={3}>
          보안 에이전트 설치 시 입력이 필요한 정보는 <span style={{ color: '#ff5252', fontWeight: 'bold' }}>파인더갭 관리자에게 문의</span>해 주세요.
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={osTab}
            onChange={handleOsTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 'medium',
                fontSize: '1rem',
              },
            }}
          >
            <Tab
              label="Windows"
              icon={<Iconify icon="mdi:microsoft-windows" width={24} height={24} />}
              iconPosition="start"
            />
            <Tab
              label="macOS"
              icon={<Iconify icon="mdi:apple" width={24} height={24} />}
              iconPosition="start"
            />
            <Tab
              label="Linux"
              icon={<Iconify icon="mdi:linux" width={24} height={24} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Windows 탭 */}
        <TabPanel value={osTab} index={0}>
          <Container maxWidth="md">
            <DownloadSection
              title="Windows 에이전트"
              description="Windows 8 / 8.1 / 10 / 11 시스템용"
              icon="mdi:microsoft-windows"
              onDownload={() => handleDownload('windows')}
              onGuide={() => handleGuide('windows')}
            />

            <Divider sx={{ my: 3 }} />

            <Box mt={4}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                시스템 요구사항
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Windows 8 이상 (32/64비트)
              </Typography>
              <Typography variant="body2" gutterBottom>
                • 권장: 2GB RAM 이상
              </Typography>
              <Typography variant="body2" gutterBottom>
                • 관리자 권한
              </Typography>

              <Typography variant="subtitle1" gutterBottom fontWeight="medium" mt={3}>
                설치 후 확인 방법
              </Typography>
              <Typography variant="body2" gutterBottom>
                Windows 설정 → 앱 → 설치된 앱에서 &quot;FindtheCCE Agent&quot;가 있는지 확인하세요.
              </Typography>
            </Box>
          </Container>
        </TabPanel>

        {/* macOS 탭 */}
        <TabPanel value={osTab} index={1}>
          <Container maxWidth="md">
            <DownloadSection
              title="macOS 에이전트"
              description="macOS 10.15 / 11 / 12 / 13 / 14 / 15 시스템용"
              icon="mdi:apple"
              onDownload={() => handleDownload('macos')}
              onGuide={() => handleGuide('macos')}
            />

            <Divider sx={{ my: 3 }} />

            <Box mt={4}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                시스템 요구사항
              </Typography>
              <Typography variant="body2" gutterBottom>
                • macOS 10.15 Catalina 이상
              </Typography>
              <Typography variant="body2" gutterBottom>
                • 권장: 2GB RAM 이상
              </Typography>
              <Typography variant="body2" gutterBottom>
                • 관리자 권한
              </Typography>

              <Typography variant="subtitle1" gutterBottom fontWeight="medium" mt={3}>
                설치 후 확인 방법
              </Typography>
              <Typography variant="body2" gutterBottom>
                시스템 환경설정 → 보안 및 개인 정보 보호에서 &quot;FindtheCCE Agent&quot;가 승인되었는지 확인하세요.
              </Typography>
            </Box>
          </Container>
        </TabPanel>

        {/* Linux 탭 */}
        <TabPanel value={osTab} index={2}>
          <Container maxWidth="md">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={linuxInstallTab}
                onChange={handleLinuxInstallTabChange}
                sx={{
                  '& .MuiTab-root': {
                    py: 1.5,
                  },
                }}
              >

                <Tab label="CLI 환경 설치" />
                <Tab label="GUI 환경 설치" />
              </Tabs>
            </Box>


            {/* CLI 환경 설치 탭 */}
            <TabPanel value={linuxInstallTab} index={0}>
              <Typography variant="h6" gutterBottom mb={3}>
                Linux 서버용 CLI 설치 방법
              </Typography>

              <Typography variant="subtitle2" gutterBottom mt={3}>
                1. 설치 스크립트 실행 (권장)
              </Typography>
              <Typography variant="body2" mb={1}>
              아래 명령을 실행하여 에이전트 패키지를 다운로드하고 압축을 해제한 후 설치를 진행합니다:
              </Typography>
              <CodeBlock code={ubuntuInstallCode} onCopy={handleCopySuccess} />

              <Divider sx={{ my: 3 }} />

              <Box mt={4} bgcolor="grey.50" p={2} borderRadius={1}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  시스템 요구사항
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • Ubuntu 18.04 이상, CentOS/RHEL 7 이상, Debian 10 이상
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • 권장: 1GB RAM 이상
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • sudo 또는 root 권한
                </Typography>

                <Typography variant="subtitle1" gutterBottom fontWeight="medium" mt={2}>
                  설치 후 확인 방법
                </Typography>
                <Typography variant="body2">
                  다음 명령어를 실행하여 에이전트가 정상적으로 실행 중인지 확인하세요:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  $ sudo systemctl status findthecce-agent
                </Typography>
              </Box>

              <Box mt={3} display="flex" justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="material-symbols:arrow-forward" />}
                  onClick={() => handleGuide('linux-cli')}
                  sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' } }}
                >
                  상세 설치 가이드 보기
                </Button>
              </Box>
            </TabPanel>


            {/* GUI 환경 설치 탭 */}
            <TabPanel value={linuxInstallTab} index={1}>
              <DownloadSection
                title="Linux 에이전트 (GUI 환경)"
                description="Ubuntu / CentOS / RHEL / Debian 시스템용"
                icon="mdi:linux"
                onDownload={() => handleDownload('linux')}
                onGuide={() => handleGuide('linux')}
              />

              <Divider sx={{ my: 3 }} />

              <Box mt={4}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  시스템 요구사항
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • Ubuntu 18.04 이상, CentOS/RHEL 7 이상, Debian 10 이상
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • 권장: 2GB RAM 이상
                </Typography>
                <Typography variant="body2" gutterBottom>
                  • sudo 권한
                </Typography>
              </Box>
            </TabPanel>
          </Container>
        </TabPanel>
      </Card>

      {/* 복사 완료 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}