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
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';
import ListSubheader from '@mui/material/ListSubheader';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Iconify } from 'src/components/iconify';

import { ExecuteAgentRequest } from 'src/api/services';

// Interfaces and Command Definitions
import { 
  Command, 
  Agent, 
  Credential, 
  COMMANDS
} from './execute-common';

// Props 타입 정의
interface ExecuteTagViewProps {
  agents: Agent[];
  credentials: Credential[];
  executeCommand: (request: ExecuteAgentRequest) => Promise<any>;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export function ExecuteTagView({ agents, credentials, executeCommand }: ExecuteTagViewProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [selectedCommandList, setSelectedCommandList] = useState<Command[]>([]);
  const [executionTime, setExecutionTime] = useState<string>('');
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [showCredentialSelect, setShowCredentialSelect] = useState<boolean>(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 알림 상태
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [executingAgents, setExecutingAgents] = useState(false);

  // 사용 가능한 태그 추출
  useEffect(() => {
    const tags = Array.from(
      new Set(agents.flatMap(agent => agent.tags))
    ).sort();
    setAvailableTags(tags);
  }, [agents]);

  // 선택한 태그에 맞는 에이전트 필터링
  const filteredAgents = selectedTags.length > 0
    ? agents.filter(agent => 
        selectedTags.some(tag => agent.tags.includes(tag))
      )
    : [];

  // DB 명령어인지 확인하여 자격 증명 선택 표시 여부 결정
  useEffect(() => {
    const hasDbCommand = selectedCommandList.some(cmd => cmd.id.startsWith('db_'));
    setShowCredentialSelect(hasDbCommand);
    
    // DB 명령어가 아니면 자격 증명 선택 초기화
    if (!hasDbCommand) {
      setSelectedCredential('');
    }
  }, [selectedCommandList]);

  const handleTagsChange = (event: SelectChangeEvent<typeof selectedTags>) => {
    const {
      target: { value },
    } = event;
    setSelectedTags(
      typeof value === 'string' ? value.split(',') : value,
    );
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

  const handleCredentialChange = (event: SelectChangeEvent) => {
    setSelectedCredential(event.target.value);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleExecuteCommand = async () => {
    // 태그가 선택되지 않았거나 필터링된 에이전트가 없으면 종료
    if (selectedTags.length === 0 || filteredAgents.length === 0) return;

    setExecutingAgents(true);
    setAlertMessage(`${filteredAgents.length}개 에이전트에 명령을 실행 중입니다...`);
    setAlertSeverity('info');
    setAlertOpen(true);
    
    let successCount = 0;
    let failCount = 0;

    try {
      // 모든 필터링된 에이전트에 대해 명령 실행
      const executePromises = filteredAgents.map(async (agent) => {
        try {
          // 새로운 API 요청 형식에 맞게 데이터 구성
          const formData: ExecuteAgentRequest = {
            agent_id: agent.id,
            execution_time: executionTime || new Date().toISOString().slice(0, 16), // 빈 값이면 현재 시간 사용
            select_credential: showCredentialSelect ? selectedCredential : null,
            command: selectedCommandList.map(cmd => cmd.id)
          };
      
          await executeCommand(formData);
          successCount+=1;
          return { success: true, agent: agent.name };
        } catch (error) {
          failCount+=1;
          console.error(`Error executing command on agent ${agent.name}:`, error);
          return { success: false, agent: agent.name, error };
        }
      });
    
      // 모든 실행 요청 완료 대기
      await Promise.all(executePromises);
    
      // 결과 메시지 표시
      let resultMessage = '';
      if (successCount === filteredAgents.length) {
        resultMessage = `모든 에이전트(${successCount}개)에 명령 실행을 성공했습니다.`;
        setAlertSeverity('success');
      } else if (successCount > 0) {
        resultMessage = `일부 에이전트에 명령 실행 완료: 성공 ${successCount}개, 실패 ${failCount}개`;
        setAlertSeverity('info');
      } else {
        resultMessage = `모든 에이전트(${filteredAgents.length}개)에 명령 실행 실패`;
        setAlertSeverity('error');
      }
      
      setAlertMessage(resultMessage);
      setAlertOpen(true);
    } catch (error) {
      setAlertMessage('명령 실행 중 오류가 발생했습니다.');
      setAlertSeverity('error');
      setAlertOpen(true);
      console.error('명령 실행 중 오류:', error);
    } finally {
      setExecutingAgents(false);
    }
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

  // 실행 버튼 비활성화 조건
  const isExecuteDisabled = () => {
    // 태그 선택 안됨 또는 해당하는 에이전트 없음
    if (selectedTags.length === 0 || filteredAgents.length === 0) return true;
    
    // 명령어 선택 안됨
    if (selectedCommandList.length === 0) return true;
    
    // DB 명령어인데 자격 증명 선택 안됨
    if (showCredentialSelect && !selectedCredential) return true;
    
    // 명령 실행 중
    if (executingAgents) return true;
    
    return false;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Command Configuration" />
          <Divider />
          <CardContent>
            <Stack spacing={3}>
              {/* Tag Selection */}
              <FormControl fullWidth>
                <InputLabel id="tags-select-label">Select Tags</InputLabel>
                <Select
                  labelId="tags-select-label"
                  id="tags-select"
                  multiple
                  value={selectedTags}
                  onChange={handleTagsChange}
                  input={<OutlinedInput label="Select Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {availableTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      <Checkbox checked={selectedTags.indexOf(tag) > -1} />
                      <ListItemText primary={tag} />
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Select tags to execute commands on all matching agents
                </FormHelperText>
              </FormControl>

              {/* Display selected agents */}
              {filteredAgents.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Agents ({filteredAgents.length}):
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {filteredAgents.map((agent) => (
                      <Chip
                        key={agent.id}
                        label={`${agent.name} (${agent.ipAddress}) - ${agent.status}`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

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
                startIcon={<Iconify icon={executingAgents ? "mdi:loading" : "mdi:play"} />}
                onClick={handleExecuteCommand}
                disabled={isExecuteDisabled()}
              >
                {executingAgents ? 'Executing...' : 'Execute Command'}
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