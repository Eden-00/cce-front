import { useState, useCallback, useEffect } from 'react';

import { ResultService, ResultData } from 'src/api/services'; // 먼저 서비스 import

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
import { ResultFileDialog } from './result-file-dialog';

import type { ResultProps } from '../result-table-row';

export function ResultView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  
  // 데이터 로딩 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultProps[]>([]);
  
  // 파일 내용 보기 관련 상태
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);

  // 파일명 파싱 함수 수정
  const parseFileName = (fileData: ResultData): ResultProps => {
    const fileName = fileData.filename; // filename 프로퍼티 사용
    const [agent, timestamp, field, subject] = fileName.split('_');
    return {
      id: fileName,
      agent,
      executionTime: timestamp,
      field,
      subject: subject.replace('.xml', '')
    };
  };

  // API에서 결과 데이터 가져오기
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ResultService.getAll();
      console.log(response)
      if (response.status === 'success') {
        const parsedResults = response.files.map(parseFileName);
        setResults(parsedResults);
      } else {
        setError('데이터를 불러오는 데 실패했습니다.');
      }
      
      setLoading(false);
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
    try {
      const content = await ResultService.getFileContent(fileName);
      setSelectedFile(fileName);
      setFileContent(content);
      setFileDialogOpen(true);
    } catch (err) {
      console.error('파일 내용 조회 오류:', err);
      setError('파일 내용을 불러오는 데 실패했습니다.');
    }
  }, []);

  const handleCloseFileDialog = () => {
    setFileDialogOpen(false);
    setSelectedFile(null);
    setFileContent(null);
  };

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
                      { id: 'action', label: '액션' },
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

      <ResultFileDialog 
        open={fileDialogOpen}
        fileName={selectedFile || ''}
        fileContent={fileContent || ''}
        onClose={handleCloseFileDialog}
      />
    </DashboardContent>
  );
}

// useTable 훅 구현
export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('executionTime');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

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