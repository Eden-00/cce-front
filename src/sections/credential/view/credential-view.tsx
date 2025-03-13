import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// API 서비스 임포트
import { CredentialService } from 'src/api/services';

// 대시보드 레이아웃 임포트
import { DashboardContent } from 'src/layouts/dashboard';

// 아이콘 및 스크롤바 컴포넌트 임포트
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// 테이블 관련 컴포넌트 임포트
import { TableNoData } from '../table-no-data';
import { CredentialTableRow } from '../credential-table-row';
import { CredentialTableHead } from '../credential-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { CredentialTableToolbar } from '../credential-table-toolbar';
import { CredentialDialog } from '../credential-dialog';
import { emptyRows, applyFilter, getComparator } from '../utils';

// 실제 데이터 구조에 맞게 수정된 타입
export type CredentialProps = {
  id: string | number;
  name: string;
  database_type: string;
  database_port: number;
  auth_type: string;
  created: string;
  username?: string;
  host?: string;
  password?: string;
  created_by?: string;
  last_used_by?: string;
};

// ----------------------------------------------------------------------

export function CredentialView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCredentialId, setCurrentCredentialId] = useState<string | number | null>(null);
  const [credentials, setCredentials] = useState<CredentialProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // API에서 데이터 가져오기 - 여기를 변경
  const fetchCredentials = async () => {
    setLoading(true);
    setApiError('');
    try {
      const response = await CredentialService.getAll();
      if (response && Array.isArray(response)) {
        setCredentials(response);
      } else if (response && response.credentials && Array.isArray(response.credentials)) {
        setCredentials(response.credentials);
      } else {
        setApiError('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setApiError('Failed to load credentials data');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCredentials();
  }, []);

  // 필터링된 데이터
  const dataFiltered = applyFilter({
    inputData: credentials,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // 새 크레덴셜 추가 버튼 클릭
  const handleNewCredential = () => {
    setIsEditMode(false);
    setCurrentCredentialId(null);
    setOpenDialog(true);
  };

  // 편집 버튼 클릭
  const handleEditCredential = (row: CredentialProps) => {
    setIsEditMode(true);
    setCurrentCredentialId(row.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // 다이얼로그가 닫힐 때 상태 초기화
    setIsEditMode(false);
    setCurrentCredentialId(null);
  };

  const handleSuccess = () => {
    setOpenSnackbar(true);
    // 데이터 새로고침
    fetchCredentials();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleRefresh = () => {
    fetchCredentials();
  };
  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Credential
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
          onClick={handleNewCredential}
        >
          New Credential
        </Button>
      </Box>

      <Card>
        <CredentialTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress />
          </Box>
        ) : apiError ? (
          <Box p={3}>
            <Alert severity="error">{apiError}</Alert>
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <CredentialTableHead
                    order={table.order}
                    orderBy={table.orderBy}
                    rowCount={credentials.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        credentials.map((credential) => credential.id.toString())
                      )
                    }
                    headLabel={[
                      { id: 'name', label: 'Name' },
                      { id: 'database_type', label: 'Database Type' },
                      { id: 'database_port', label: 'Port' },
                      { id: 'auth_type', label: 'Auth Type' },
                      { id: 'created', label: 'Created Date' },
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
                        <CredentialTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id.toString())}
                          onSelectRow={() => table.onSelectRow(row.id.toString())}
                          onEditRow={handleEditCredential}
                        />
                      ))}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, credentials.length)}
                    />

                    {notFound && <TableNoData searchQuery={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              component="div"
              page={table.page}
              count={credentials.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              rowsPerPageOptions={[10, 25, 50]}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      {/* Credential Dialog */}
      <CredentialDialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        onSuccess={handleSuccess} 
        editMode={isEditMode}
        credentialId={currentCredentialId as any}
      />

      {/* Success Notification */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {isEditMode 
            ? 'Credential updated successfully!' 
            : 'Credential created successfully!'}
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