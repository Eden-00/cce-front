import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// API 서비스 임포트
import { AgentData, AgentService } from 'src/api/services';

import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { AgentTableRow, AgentProps } from '../agent-table-row'; // AgentProps도 함께 가져옵니다
import { AgentTableHead } from '../agent-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { AgentTableToolbar } from '../agent-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import AgentDialog from '../agent-dialog';

// 데이터 변환 함수: API 응답 -> 프론트엔드 타입
const mapApiAgentToAgentProps = (apiAgent: AgentData): AgentProps => {
  // 태그 처리: 다양한 형태의 태그 데이터 처리
  let tagArray: string[] = [];
  
  if (Array.isArray(apiAgent.tags)) {
    // tags가 이미 배열인 경우 (["string"])
    tagArray = apiAgent.tags;
  } else if (typeof apiAgent.tags === 'string') {
    try {
      // "{}" 형태의 문자열을 파싱
      const parsedTags = JSON.parse(apiAgent.tags);
      if (Array.isArray(parsedTags)) {
        tagArray = parsedTags;
      } else if (parsedTags && typeof parsedTags === 'object') {
        tagArray = Object.keys(parsedTags);
      }
    } catch {
      // 파싱 실패시 단일 태그로 처리
      tagArray = apiAgent.tags ? [apiAgent.tags] : [];
    }
  } else if (apiAgent.tags && typeof apiAgent.tags === 'object') {
    tagArray = Object.keys(apiAgent.tags);
  }

  // 상태 결정: last_active 기반으로 online/offline 상태 설정
  let status = 'offline';
  if (apiAgent.last_active) {
    const lastActiveDate = new Date(apiAgent.last_active);
    const currentDate = new Date();
    const differenceInMinutes = (currentDate.getTime() - lastActiveDate.getTime()) / (1000 * 60);
    
    if (differenceInMinutes < 5) {
      status = 'online';
    } else if (differenceInMinutes < 60) {
      status = 'idle';
    }
  }

  return {
    id: apiAgent.id,
    name: apiAgent.name || 'Unnamed Agent',
    os: apiAgent.os || 'Unknown',
    agent_id: apiAgent.agent_id,
    osVersion: apiAgent.os_version || '',
    ipAddress: apiAgent.ip,
    purpose: apiAgent.purpose || '',
    admin: apiAgent.admin || 'False',
    tags: tagArray,
    last_active: apiAgent.last_active,
    status
  };
};

export function AgentView() {
  const router = useRouter();
  const table = useTable();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentProps | null>(null);
  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // error를 errorMsg로 변경
  const [agents, setAgents] = useState<AgentProps[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);

  const handleOpenDialog = async (agent: AgentProps | null = null) => {
    if (agent) {
      try {
        // getById로 해당 에이전트의 상세 정보 조회
        const detailedAgent = await AgentService.getById(agent.agent_id);

        if (detailedAgent) {
          // 기존 에이전트 정보에 상세 정보 매핑
          const updatedAgent: AgentProps = {
            ...agent,
            ...mapApiAgentToAgentProps(detailedAgent)
          };

          setCurrentAgent(updatedAgent);
        } else {
          // 조회 실패 시 기존 에이전트 정보 사용
          setCurrentAgent(agent);
        }
      } catch (err) { // error1을 err로 변경
        console.error('에이전트 상세 정보 조회 오류:', err);
        // 오류 발생 시 기존 에이전트 정보 사용
        setCurrentAgent(agent);
      }
    } else {
      // 새 에이전트 생성의 경우
      setCurrentAgent(null);
    }
  
    // 다이얼로그 오픈
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveAgent = (agentData: AgentProps) => {
    // API 호출 또는 상태 업데이트 로직
    console.log('저장된 에이전트 데이터:', agentData);
    fetchAgents(); // 목록 새로고침
  };

  // 에이전트 삭제 핸들러
  const handleDeleteAgent = async (agent_id: string) => {
    try {
      setLoading(true);
      const response = await AgentService.deleteAgent(agent_id);
      
      if (response.status === 'success') {
        setSnackbar({
          open: true,
          message: '에이전트가 성공적으로 삭제되었습니다.',
          severity: 'success'
        });
        
        // 목록 새로고침
        fetchAgents();
      } else {
        setSnackbar({
          open: true,
          message: response.message || '에이전트 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    } catch (err) { 
      console.error('에이전트 삭제 오류:', err);
      setSnackbar({
        open: true,
        message: '에이전트 삭제 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 여러 에이전트 삭제 대화상자 열기
  const handleOpenDeleteConfirmDialog = () => {
    setOpenDeleteConfirmDialog(true);
  };

  // 여러 에이전트 삭제 대화상자 닫기
  const handleCloseDeleteConfirmDialog = () => {
    setOpenDeleteConfirmDialog(false);
  };

  // 선택된 여러 에이전트 삭제 처리
  const handleDeleteSelectedAgents = async () => {
    handleCloseDeleteConfirmDialog();
    
    try {
      setLoading(true);
      
      // 선택된 ID를 agent_id로 변환
      const selectedAgentIds = table.selected.map(id => {
        const foundAgent = agents.find(agentItem => agentItem.id === id);
        return foundAgent ? foundAgent.agent_id : '';
      }).filter(id => id !== ''); // 빈 값 필터링
      
      let successCount = 0;
      let failCount = 0;
      
      // Promise.all을 사용하여 병렬로 삭제 요청 처리
      await Promise.all(
        selectedAgentIds.map(async (agent_id) => {
          try {
            const response = await AgentService.deleteAgent(agent_id);
            if (response.status === 'success') {
              successCount += 1;
            } else {
              failCount += 1;
            }
          } catch (err) {
            console.error(`에이전트 ID ${agent_id} 삭제 실패:`, err);
            failCount += 1;
          }
        })
      );
      
      // 결과 메시지 표시
      if (successCount > 0) {
        setSnackbar({
          open: true,
          message: `${successCount}개의 에이전트가 삭제되었습니다${failCount > 0 ? `, ${failCount}개 삭제 실패` : ''}.`,
          severity: failCount > 0 ? 'warning' : 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: '에이전트 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
      
      // 선택 항목 초기화
      table.onSelectAllRows(false, []);
      
      // 목록 새로고침
      fetchAgents();
    } catch (err) {
      console.error('에이전트 삭제 오류:', err);
      setSnackbar({
        open: true,
        message: '에이전트 삭제 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // API에서, 에이전트 목록 가져오기
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // API 호출 및 응답 처리
      const response = await AgentService.getAll();
      
      // 응답 데이터를 프론트엔드 타입으로 변환
      const mappedAgents = response.map(mapApiAgentToAgentProps);
      setAgents(mappedAgents);
      
      setLoading(false);
    } catch (err) {
      setErrorMsg('서버 연결에 문제가 발생했습니다.');
      console.error('API 호출 오류:', err);
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const dataFiltered: AgentProps[] = applyFilter({
    inputData: agents,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  // 현재 페이지에 표시되는 행의 ID 목록 계산
  const visibleRows = dataFiltered
    .slice(
      table.page * table.rowsPerPage,
      table.page * table.rowsPerPage + table.rowsPerPage
    );
  
  const visibleRowIds = visibleRows.map(row => row.id);

  // 전체 선택 핸들러 수정 - 현재 페이지의 행만 선택
  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      table.onSelectAllRows(true, visibleRowIds);
    } else {
      table.onSelectAllRows(false, []);
    }
  };

  const notFound = !dataFiltered.length && !!filterName;

  // 새 에이전트 추가 버튼 핸들러
  const handleNewAgent = () => {
    router.push('/agent-download');
  };

  const handleRefresh = () => {
    fetchAgents();
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Agent
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:refresh" />}
          onClick={handleRefresh}
          sx={{ mr: 1 }}
          disabled={loading}
        >
          새로고침
        </Button>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleNewAgent}
        >
          New Agent
        </Button>
      </Box>

      <Card>
        <AgentTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onDeleteSelected={handleOpenDeleteConfirmDialog}
        />

        {errorMsg && (
          <Alert severity="error" sx={{ m: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <AgentTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={agents.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={handleSelectAllCurrentPage}
                    headLabel={[
                      { id: 'name', label: 'Agent Name' },
                      { id: 'os', label: 'OS / Version' },
                      { id: 'ipAddress', label: 'IP Address' },
                      { id: 'purpose', label: '용도' },
                      { id: 'admin', label: '관리자' },
                      { id: 'tags', label: 'Tag' },
                      { id: 'status', label: '상태' },
                      { id: '' },
                    ]}
                    rowsPerPage={table.rowsPerPage}
                    page={table.page}
                    visibleRows={visibleRows.length}
                  />
                  <TableBody>
                    {visibleRows.map((row) => (
                      <AgentTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onEdit={() => handleOpenDialog(row)}
                        onDelete={handleDeleteAgent}
                      />
                    ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, agents.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={dataFiltered.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[10, 25, 30]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      {/* 에이전트 다이얼로그 */}
      <AgentDialog
        open={openDialog}
        onClose={handleCloseDialog}
        agent={currentAgent}
        onSave={handleSaveAgent}
      />

      {/* 다중 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDeleteConfirmDialog}
        onClose={handleCloseDeleteConfirmDialog}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          에이전트 삭제 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            선택한 {table.selected.length}개의 에이전트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmDialog} color="inherit">
            취소
          </Button>
          <Button onClick={handleDeleteSelectedAgents} color="error" variant="contained" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
    // 페이지 변경 시 선택 항목 초기화
    setSelected([]);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
      // 페이지당 행 수 변경 시 선택 항목 초기화
      setSelected([]);
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}