import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { EXECUTE_ENDPOINTS } from 'src/api/endpoints';
import { ExecuteAgentRequest } from 'src/api/services';
import { ExecuteSingleView } from './execute-single';
import { ExecuteTagView } from './execute-tag';
import { Agent, Credential } from './execute-common';

// 테스트 데이터: AgentService.getAll() 호출 결과를 시뮬레이션
const TEST_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    name: 'Database Server',
    ipAddress: '192.168.1.10',
    status: 'online',
    tags: ['database']
  },
  {
    id: 'agent-002',
    name: 'Web Server 1',
    ipAddress: '192.168.1.11',
    status: 'online',
    tags: ['web']
  },
  {
    id: 'agent-003',
    name: 'WAS Server',
    ipAddress: '192.168.1.12',
    status: 'online',
    tags: ['was']
  },
  {
    id: 'agent-004',
    name: 'Linux Server',
    ipAddress: '192.168.1.13',
    status: 'offline',
    tags: ['server', 'linux']
  },
  {
    id: 'agent-005',
    name: 'Windows Server',
    ipAddress: '192.168.1.14',
    status: 'online',
    tags: ['server', 'windows']
  },
  {
    id: 'agent-006',
    name: 'Development PC',
    ipAddress: '192.168.1.15',
    status: 'online',
    tags: ['pc']
  },
  {
    id: 'agent-007',
    name: 'Test Database',
    ipAddress: '192.168.1.16',
    status: 'online',
    tags: ['database']
  },
  {
    id: 'agent-008',
    name: 'Test Web Server',
    ipAddress: '192.168.1.17',
    status: 'maintenance',
    tags: ['web']
  }
];

// 테스트 데이터: CredentialService.getAll() 호출 결과를 시뮬레이션
const TEST_CREDENTIALS: Credential[] = [
  {
    id: 1,
    name: 'Oracle 운영 DB'
  },
  {
    id: 2,
    name: 'MySQL 개발 DB'
  },
  {
    id: 3,
    name: 'PostgreSQL DB'
  },
  {
    id: 4,
    name: 'MSSQL 운영 서버'
  },
  {
    id: 5,
    name: 'MariaDB 운영 서버'
  }
];

// 명령 실행 함수
const executeAgentCommand = async (request: ExecuteAgentRequest) => {
  try {
    // URLSearchParams 객체를 사용하여 form 데이터 형식으로 변환
    const params = new URLSearchParams();
    params.append('agent_id', request.agent_id);
    
    if (request.execution_time) {
      params.append('execution_time', request.execution_time);
    }
    
    if (request.select_credential) {
      params.append('select_credential', request.select_credential);
    }
    
    // 명령어 배열을 JSON 문자열로 변환하여 추가
    params.append('command', JSON.stringify(request.command));
    
    // API 요청
    const response = await axios.post(EXECUTE_ENDPOINTS.EXECUTE_AGENT, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error executing agent command:', error);
    throw error;
  }
};

export function ExecuteView() {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 테스트 데이터 로드 시뮬레이션
  useEffect(() => {
    const loadTestData = async () => {
      setLoading(true);
      // API 호출 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 800));
      setAgents(TEST_AGENTS);
      setCredentials(TEST_CREDENTIALS);
      setLoading(false);
    };

    loadTestData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <DashboardContent>
      <Box mb={5}>
        <Typography variant="h4">Execute Command</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          aria-label="command execution method"
        >
          <Tab label="Single Agent" />
          <Tab label="Tag-based Multiple Agents" />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {selectedTab === 0 && (
            <ExecuteSingleView 
              credentials={credentials} 
              executeCommand={executeAgentCommand} 
            />
          )}
          {selectedTab === 1 && (
            <ExecuteTagView 
              agents={agents} 
              credentials={credentials} 
              executeCommand={executeAgentCommand} 
            />
          )}
        </>
      )}
    </DashboardContent>
  );
}