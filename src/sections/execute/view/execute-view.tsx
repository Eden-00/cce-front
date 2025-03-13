import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { ExecuteAgentRequest } from 'src/api/services';
import { ExecuteSingleView } from './execute-single';
import { ExecuteTagView } from './execute-tag';
import { Agent, Credential } from './execute-common';

// 명령 실행 함수
const executeAgentCommand = async (request: ExecuteAgentRequest) => {
  try {
    // API 서비스 사용
    const response = await fetch('/api/front/agent-execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        agent_id: request.agent_id,
        execution_time: request.execution_time || '',
        select_credential: request.select_credential || '',
        command: JSON.stringify(request.command),
        ...(request.db_folder && { db_folder: request.db_folder }),
        ...(request.queue && { queue: request.queue }),
      }),
    });

    if (!response.ok) {
      throw new Error('명령 실행 중 오류가 발생했습니다.');
    }

    return await response.json();
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
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
 // useEffect 내부의 데이터 로드 부분만 수정

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 직접 fetch를 사용하여 에이전트 데이터 로드
        const agentResponse = await fetch('/api/front/agent-view');
        
        if (!agentResponse.ok) {
          throw new Error(`에이전트 데이터 로드 실패: ${agentResponse.status}`);
        }
        
        const agentData = await agentResponse.json();
        console.log('Agent API Response:', agentData);
        
        if (agentData && agentData.status === 'success' && Array.isArray(agentData.data)) {
          // Agent 인터페이스에 맞게 변환
          const formattedAgents = agentData.data.map((agent) => ({
            id: agent.agent_id || '',
            name: agent.name || 'Unknown',
            ipAddress: agent.ip || '',
            status: agent.status || 'offline',
            os: agent.os || '',
            osVersion: agent.os_version || '',
            tags: agent.tags || []
          }));
          
          setAgents(formattedAgents);
        } else {
          console.error('API 응답 구조가 예상과 다릅니다:', agentData);
          throw new Error('에이전트 데이터 형식이 올바르지 않습니다.');
        }
        
        // 자격 증명 데이터 로드
        const credResponse = await fetch('/api/front/credential-view');
        const credData = await credResponse.json();
        console.log('Credential API Response:', credData);
        
        if (credData && credData.status === 'success' && Array.isArray(credData.credentials)) {
          const formattedCredentials = credData.credentials.map((cred) => ({
            id: cred.id,
            name: cred.name || `Credential ${cred.id}`
          }));
          
          setCredentials(formattedCredentials);
        } else {
          console.warn('자격 증명 데이터 형식이 올바르지 않습니다:', credData);
          setCredentials([]);
        }
      } catch (err) {
        console.error('데이터 로드 중 오류:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCloseError = () => {
    setError(null);
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
          {/* SingleAgent 탭 내용 */}
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

      {/* 에러 알림 */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}