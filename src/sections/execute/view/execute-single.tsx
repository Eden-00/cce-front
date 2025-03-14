import { useState, useEffect, ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ListSubheader from '@mui/material/ListSubheader';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Iconify } from 'src/components/iconify';
import { AgentService, ExecuteAgentRequest } from 'src/api/services';

import { 
  Command, 
  Agent, 
  Credential, 
  COMMANDS
} from './execute-common';

// OS에 따른 아이콘 매핑 함수
const getOsIcon = (serverName: string): string => {
  // 서버 이름에서 OS 타입 추출 시도
  const nameLower = serverName.toLowerCase();
  
  if (nameLower.includes('database')) return 'mdi:database';
  if (nameLower.includes('web')) return 'mdi:web';
  if (nameLower.includes('was')) return 'mdi:server';
  
  // 다음은 OS 기반 아이콘
  if (nameLower.includes('linux')) return 'mdi:linux';
  if (nameLower.includes('windows')) return 'mdi:microsoft-windows';
  if (nameLower.includes('mac') || nameLower.includes('darwin')) return 'mdi:apple';
  if (nameLower.includes('ubuntu')) return 'mdi:ubuntu';
  if (nameLower.includes('android')) return 'mdi:android';
  if (nameLower.includes('ios')) return 'mdi:apple-ios';
  
  if (nameLower.includes('development') || nameLower.includes('pc')) return 'mdi:desktop-classic';
  if (nameLower.includes('test')) return 'mdi:test-tube';
  
  // 기본 아이콘
  return 'mdi:server-network';
};

// 상태에 따른 색상 매핑 함수
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'online':
      return '#4caf50'; // 녹색
    case 'offline':
      return '#f44336'; // 빨간색
    case 'maintenance':
      return '#ff9800'; // 주황색
    case 'idle':
      return '#ffeb3b'; // 노란색
    default:
      return '#9e9e9e'; // 회색
  }
};

// Props 타입 정의
interface ExecuteSingleViewProps {
  credentials: Credential[];
  executeCommand: (request: ExecuteAgentRequest) => Promise<any>;
}

export function ExecuteSingleView({ credentials, executeCommand }: ExecuteSingleViewProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [selectedCommandList, setSelectedCommandList] = useState<Command[]>([]);
  const [executionTime, setExecutionTime] = useState<string>('');
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [showCredentialSelect, setShowCredentialSelect] = useState<boolean>(false);
  const [dbFolder, setDbFolder] = useState<string>('');
  const [queue, setQueue] = useState<string>('');
  
  // 에이전트 데이터 상태
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 알림 상태
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  
  // 드롭다운 메뉴 상태
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // 에이전트 데이터 가져오기
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        
        // AgentService 사용하여 데이터 가져오기
        const agentData = await AgentService.getAll();
        console.log('Agent data from API:', agentData);
        
        // 받아온 데이터를 Agent 인터페이스에 맞게 변환
        const formattedAgents: Agent[] = agentData.map((agent) => ({
          id: agent.agent_id || agent.id || '',
          name: agent.name || 'Unknown',
          ipAddress: agent.ip || agent.ip || '',
          status: agent.status || 'offline',
          os: agent.os || '',
          osVersion: agent.os_version || agent.os_version || '',
          tags: agent.tags || []
        }));
        
        setAgents(formattedAgents);
      } catch (error) {
        console.error('Error fetching agents:', error);
        setAlertMessage('에이전트 목록을 불러오는 중 오류가 발생했습니다.');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, []);

  // DB 명령어인지 확인하여 자격 증명 선택 표시 여부 결정
  useEffect(() => {
    const hasDbCommand = selectedCommandList.some(cmd => cmd.id.startsWith('db_'));
    setShowCredentialSelect(hasDbCommand);
    
    // DB 명령어가 아니면 자격 증명 선택 초기화
    if (!hasDbCommand) {
      setSelectedCredential('');
    }
  }, [selectedCommandList]);

  const handleAgentChange = (event: SelectChangeEvent) => {
    setSelectedAgentId(event.target.value);
  };

  const handleCommandChange = (event: SelectChangeEvent) => {
    const commandId = event.target.value;
    setSelectedCommand(commandId);
    
    // 명령어 객체 찾기
    const commandObj = COMMANDS.find(cmd => cmd.id === commandId);
    
    if (commandObj && !selectedCommandList.some(cmd => cmd.id === commandId)) {
      setSelectedCommandList([...selectedCommandList, commandObj]);
    }
  };

  const handleRemoveCommand = (commandId: string) => {
    setSelectedCommandList(selectedCommandList.filter(cmd => cmd.id !== commandId));
  };

  const handleExecutionTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setExecutionTime(event.target.value);
  };

  const handleDbFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDbFolder(event.target.value);
  };

  const handleQueueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQueue(event.target.value);
  };

  const handleCredentialChange = (event: SelectChangeEvent) => {
    setSelectedCredential(event.target.value);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleExecuteCommand = async () => {
    try {
      // 새로운 API 요청 형식에 맞게 데이터 구성
      const formData: ExecuteAgentRequest = {
        agent_id: selectedAgentId,
        execution_time: executionTime || new Date().toISOString().slice(0, 16), // 빈 값이면 현재 시간 사용
        select_credential: showCredentialSelect ? selectedCredential : null,
        command: selectedCommandList.map(cmd => cmd.id),
        db_folder: dbFolder || undefined,
        queue: queue || undefined
      };
      
      // 명령 실행 요청
      const result = await executeCommand(formData);
      
      // 성공 메시지 표시
      setAlertMessage('명령이 성공적으로 실행되었습니다.');
      setAlertSeverity('success');
      setAlertOpen(true);
      
      console.log('Command execution successful', result);
    } catch (error) {
      // 오류 메시지 표시
      setAlertMessage('명령 실행 중 오류가 발생했습니다.');
      setAlertSeverity('error');
      setAlertOpen(true);
      
      console.error('Error executing command:', error);
    }
  };

  // 실행 버튼 비활성화 조건
  const isExecuteDisabled = () => {
    // 에이전트 선택 안됨
    if (!selectedAgentId) return true;
    
    // 명령어 선택 안됨
    if (selectedCommandList.length === 0) return true;
    
    // DB 명령어인데 자격 증명 선택 안됨
    if (showCredentialSelect && !selectedCredential) return true;
    
    return false;
  };

  // 그룹별 명령어 목록 구성
  const groupedCommands = () => {
    // 중복 없는 그룹 목록 가져오기
    const groups = Array.from(new Set(COMMANDS.map(cmd => cmd.group)));
    
    return groups.map(group => [
      // 그룹 헤더
      <ListSubheader key={`group-${group}`} sx={{ backgroundColor: 'background.neutral' }}>
        {group}
      </ListSubheader>,
      // 해당 그룹의 명령어들
      ...COMMANDS.filter(cmd => cmd.group === group).map(cmd => (
        <MenuItem key={cmd.id} value={cmd.id}>{cmd.name}</MenuItem>
      ))
    ]).flat();
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Command Configuration" />
          <Divider />
          <CardContent>
            <Stack spacing={3}>
              {/* Agent Selection */}
              <FormControl fullWidth>
                <InputLabel id="agent-select-label">Select Agent</InputLabel>
                <Select
                  labelId="agent-select-label"
                  id="agent-select"
                  value={selectedAgentId}
                  onChange={handleAgentChange}
                  label="Select Agent"
                  open={dropdownOpen}
                  onOpen={() => setDropdownOpen(true)}
                  onClose={() => setDropdownOpen(false)}
                  disabled={loading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {loading ? '에이전트 로딩 중...' : 'Select an agent'}
                  </MenuItem>
                  
                  {!loading && agents.length === 0 && (
                    <MenuItem disabled>
                      사용 가능한 에이전트가 없습니다
                    </MenuItem>
                  )}
                  
                  {!loading && agents.map((agent) => {
                    const osIcon = agent.os ? 
                      getOsIcon(agent.os) : 
                      getOsIcon(agent.name);
                    const statusColor = getStatusColor(agent.status);
                    
                    return (
                      <MenuItem key={agent.id} value={agent.id} sx={{ py: 1 }}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Box display="flex" alignItems="center" flexGrow={1}>
                            <Iconify icon={osIcon} width={20} height={20} sx={{ mr: 1 }} />
                            <Typography variant="body1">
                              {agent.name} 
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <Typography variant="caption" sx={{ mx: 1 }}>
                              ({agent.ipAddress})
                            </Typography>
                            <Box 
                              sx={{ 
                                width: 10, 
                                height: 10, 
                                borderRadius: '50%', 
                                backgroundColor: statusColor,
                                ml: 1
                              }} 
                            />
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Command Selection */}
              <FormControl fullWidth>
                <InputLabel id="command-select-label">Select Command</InputLabel>
                <Select
                  labelId="command-select-label"
                  id="command-select"
                  value={selectedCommand}
                  onChange={handleCommandChange}
                  label="Select Command"
                >
                  <MenuItem value="" disabled>Select an item</MenuItem>
                  {groupedCommands()}
                </Select>
              </FormControl>

              {/* Selected Commands */}
              {selectedCommandList.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Selected Commands:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedCommandList.map((cmd) => (
                      <Chip
                        key={cmd.id}
                        label={cmd.name}
                        onDelete={() => handleRemoveCommand(cmd.id)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Database Credential Selection - 조건부 표시 */}
              {showCredentialSelect && (
                <FormControl fullWidth>
                  <InputLabel id="credential-select-label">Credentials</InputLabel>
                  <Select
                    labelId="credential-select-label"
                    id="credential-select"
                    value={selectedCredential}
                    onChange={handleCredentialChange}
                    label="Credentials"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {credentials.map((credential) => (
                      <MenuItem key={credential.id} value={credential.id.toString()}>
                        {credential.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* DB Folder - 새로 추가된 필드 */}
              {showCredentialSelect && (
                <TextField
                  id="db-folder"
                  label="DB Folder"
                  value={dbFolder}
                  onChange={handleDbFolderChange}
                  fullWidth
                  helperText="Database 스캔 폴더 위치를 지정합니다"
                />
              )}

              {/* Queue 필드 추가 */}
              <TextField
                id="queue"
                label="Queue"
                value={queue}
                onChange={handleQueueChange}
                fullWidth
                helperText="선택사항: 특정 큐에 작업 할당"
              />

              {/* Execution Time */}
              <Box 
                onClick={() => {
                  const input = document.getElementById('execution-time');
                  if (input) {
                    input.focus();
                    // showPicker가 지원되는지 확인
                    if (typeof (input as any).showPicker === 'function') {
                      (input as any).showPicker();
                    }
                  }
                }} 
                sx={{ cursor: 'pointer' }}
              >
                <TextField
                  id="execution-time"
                  label="Execution Date and Time"
                  type="datetime-local"
                  value={executionTime}
                  onChange={handleExecutionTimeChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="선택하지 않으면 즉시 실행합니다"
                  fullWidth
                />
              </Box>

              {/* Execute Button */}
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<Iconify icon="mdi:play" />}
                onClick={handleExecuteCommand}
                disabled={isExecuteDisabled()}
              >
                Execute Command
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* 알림 메시지 */}
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}