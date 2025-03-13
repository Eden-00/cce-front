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

import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';

import { TableNoData } from '../table-no-data';
import { ResultTableRow } from '../result-table-row';
import { ResultTableHead } from '../result-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { ResultTableToolbar } from '../result-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { ResultProps } from '../result-table-row';

// ----------------------------------------------------------------------

// 임시 결과 데이터 (API 연동 전까지 사용)
const SAMPLE_RESULTS: ResultProps[] = [
  {
    id: '1',
    agent: 'Scanner Bot',
    executionTime: '2025-03-10 10:23:45',
    field: 'DATABASE',
    subject: 'MySQL',
    fileName: 'scan_result_001.json',
    status: 'completed'
  },
  {
    id: '2',
    agent: 'Vulnerability Detector',
    executionTime: '2025-03-09 14:12:30',
    field: 'WEB',
    subject: 'TOMCAT',
    fileName: 'vulnerability_report.xml',
    status: 'completed'
  },
  {
    id: '3',
    agent: 'Network Analyzer',
    executionTime: '2025-03-08 08:45:12',
    field: 'WAS',
    subject: 'TOMCAT',
    fileName: 'network_analysis.log',
    status: 'failed'
  },
  {
    id: '4',
    agent: 'Config Checker',
    executionTime: '2025-03-07 16:30:22',
    field: 'SERVER',
    subject: 'UBUNTU',
    fileName: 'config_check.txt',
    status: 'completed'
  },
  {
    id: '5',
    agent: 'Malware Detector',
    executionTime: '2025-03-06 11:18:54',
    field: 'PC',
    subject: 'MAC',
    fileName: 'malware_scan.json',
    status: 'completed'
  }
];

// ----------------------------------------------------------------------

export function ResultView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  
  // 데이터 로딩 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultProps[]>(SAMPLE_RESULTS);

  // API에서 결과 데이터 가져오기
  const fetchResults = useCallback(async () => {
    // 현재는 샘플 데이터를 사용하고 API 호출은 주석 처리
    setLoading(true);
    setError(null);
    
    try {
      // 실제 API 연동 시 주석 해제
      /*
      const data = await ResultService.getAll();
      setResults(data);
      */
      
      // 샘플 데이터 사용 (API 연동 전까지)
      // API 호출 시뮬레이션 (지연 시간 추가)
      setTimeout(() => {
        setResults(SAMPLE_RESULTS);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('서버 연결에 문제가 발생했습니다.');
      console.error('API 호출 오류:', err);
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);
  
  const handleViewFile = useCallback(async (fileName: string) => {
    console.log(`Viewing file: ${fileName}`);
    // TODO: 파일 내용 보기 모달 또는 페이지 열기 구현
    
    // 실제 API 연동 시 주석 해제
    /*
    try {
      const fileId = fileName.split('.')[0]; // 파일명에서 ID 추출 (프로젝트에 맞게 수정 필요)
      const content = await ResultService.getFileContent(fileId);
      // 모달 또는 새 창에 파일 내용 표시
      console.log('File content:', content);
    } catch (error) {
      console.error('파일 내용 조회 오류:', error);
    }
    */
  }, []);

  const handleRefresh = useCallback(() => {
    fetchResults();
  }, [fetchResults]);

  const dataFiltered: ResultProps[] = applyFilter({
    inputData: results,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Result Files
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:refresh" />}
          onClick={handleRefresh}
          disabled={loading}
        >
          새로고침
        </Button>
      </Box>

      <Card>
        <ResultTableToolbar
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
                  <ResultTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={results.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        results.map((result) => result.id)
                      )
                    }
                    headLabel={[
                      { id: 'agent', label: 'Agent Name' },
                      { id: 'executionTime', label: '수행시간' },
                      { id: 'field', label: '분야' },
                      { id: 'subject', label: '대상' },
                      { id: 'fileName', label: '파일명' },
                      { id: 'status', label: '상태' },
                      { id: 'action', label: '액션' },
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
                        <ResultTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onViewFile={handleViewFile}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, results.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={results.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('executionTime'); // 기본 정렬 필드 변경
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc'); // 최신 항목이 먼저 나오도록 desc로 변경

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