import Dashboard from '@mui/icons-material/Dashboard';
import SmartToy from '@mui/icons-material/SmartToy';
import Download from '@mui/icons-material/CloudDownload';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Assessment from '@mui/icons-material/Assessment';
import VpnKey from '@mui/icons-material/VpnKey';

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Dashboard />,
  },
  {
    title: 'Download',
    path: '/agent-download',
    icon: <Download />,
  },
  {
    title: 'Agent',
    path: '/agent',
    icon: <SmartToy />,
  },
  {
    title: 'Scan',
    path: '/execute',
    icon: <PlayArrow />,
  },
  {
    title: 'Result',
    path: '/result',
    icon: <Assessment />,
  },
  {
    title: 'Credential',
    path: '/credential',
    icon: <VpnKey />,
  }
];