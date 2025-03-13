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

// API 서비스 임포트
import { AgentData, AgentListResponse, AgentService } from 'src/api/services';

import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { AgentTableRow } from '../agent-table-row';
import { AgentTableHead } from '../agent-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { AgentTableToolbar } from '../agent-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import AgentDialog from '../agent-dialog';

import type { AgentProps } from '../agent-table-row';


// 데이터 변환 함수: API 응답 -> 프론트엔드 타입
const mapApiAgentToAgentProps = (apiAgent: AgentData): AgentProps => {
  // 태그 처리: 문자열 또는 객체를 배열로 변환
  let tagArray: string[] = [];
  if (typeof apiAgent.tags === 'string') {
    try {
      // "{}" 형태의 문자열을 파싱
      const parsedTags = JSON.parse(apiAgent.tags);
      if (parsedTags && typeof parsedTags === 'object') {
        tagArray = Object.keys(parsedTags);
      }
    } catch {
      tagArray = [];
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
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentProps[]>([]);

  const handleOpenDialog = async (agent: AgentProps | null = null) => {
    if (agent) {
      try {
        // getById로 해당 에이전트의 상세 정보 조회
        const detailedAgent = await AgentService.getById(agent.id);
        
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
      } catch (error1) {
        console.error('에이전트 상세 정보 조회 오류:', error1);
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

// API에서 에이전트 목록 가져오기
const fetchAgents = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // API 호출 및 응답 처리
    const response = await AgentService.getAll();
    
    // 응답 데이터를 프론트엔드 타입으로 변환
    const mappedAgents = response.map(mapApiAgentToAgentProps);
    setAgents(mappedAgents);
    
    setLoading(false);
  } catch (err) {
    setError('서버 연결에 문제가 발생했습니다.');
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
        />

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
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
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        agents.map((agent) => agent.id)
                      )
                    }
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
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <AgentTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onEdit={() => handleOpenDialog(row)}
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
              count={agents.length}
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
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
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