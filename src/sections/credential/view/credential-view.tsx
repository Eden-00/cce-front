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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
  name: string;
  host: string;
  database_type: string;
  auth_type: string;
  username: string;
  password: string;
  database_port: number;
  created_by: string;
  last_used_by: string;
  id: number;
  created: string;
};

// ----------------------------------------------------------------------

export function CredentialView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCredentialId, setCurrentCredentialId] = useState<string | number | null>(null);
  const [credentials, setCredentials] = useState<CredentialProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // API에서 데이터 가져오기 - 여기를 변경
  const fetchCredentials = async () => {
    setLoading(true);
    setApiError('');
    try {
      const response = await CredentialService.getAll();
      if (response && Array.isArray(response)) {
        setCredentials(response);
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
    setSnackbar({
      open: true,
      message: isEditMode 
        ? 'Credential updated successfully!' 
        : 'Credential created successfully!',
      severity: 'success'
    });
    // 데이터 새로고침
    fetchCredentials();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRefresh = () => {
    fetchCredentials();
  };

  // 단일 자격 증명 삭제 확인 다이얼로그 열기
  const handleOpenDeleteDialog = (id: number) => {
    setCredentialToDelete(id);
  };

  // 여러 자격 증명 삭제 확인 다이얼로그 열기
  const handleOpenDeleteMultiDialog = () => {
    setCredentialToDelete(null); // 여러 항목 삭제 시에는 null로 설정
    setOpenDeleteConfirmDialog(true);
  };

  // 삭제 확인 다이얼로그 닫기
  const handleCloseDeleteConfirmDialog = () => {
    setOpenDeleteConfirmDialog(false);
    setCredentialToDelete(null);
  };

  // 단일 자격 증명 삭제 처리
  const handleDeleteCredential = async (id: number) => {    
    try {
      setLoading(true);
      const response = await CredentialService.delete(id);
      
      if (response.status === 'success') {
        setSnackbar({
          open: true,
          message: '자격 증명이 성공적으로 삭제되었습니다.',
          severity: 'success'
        });
        
        // 목록 새로고침
        fetchCredentials();
      } else {
        setSnackbar({
          open: true,
          message: '자격 증명 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    } catch (err) { 
      console.error('자격 증명 삭제 오류:', err);
      setSnackbar({
        open: true,
        message: '자격 증명 삭제 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 선택된 여러 자격 증명 삭제 처리
  const handleDeleteSelectedCredentials = async () => {
    handleCloseDeleteConfirmDialog();
    
    if (table.selected.length === 0) return;
    
    try {
      setLoading(true);
      
      // 선택된 ID를 숫자 배열로 변환
      const selectedIds = table.selected.map(id => parseInt(id,10));
      
      let successCount = 0;
      let failCount = 0;
      
      // Promise.all을 사용하여 병렬로 삭제 요청 처리
      await Promise.all(
        selectedIds.map(async (id) => {
          try {
            const response = await CredentialService.delete(id);
            if (response.status === 'success') {
              successCount += 1;
            } else {
              failCount += 1;
            }
          } catch (err) {
            console.error(`자격 증명 ID ${id} 삭제 실패:`, err);
            failCount += 1;
          }
        })
      );
      
      // 결과 메시지 표시
      if (successCount > 0) {
        setSnackbar({
          open: true,
          message: `${successCount}개의 자격 증명이 삭제되었습니다${failCount > 0 ? `, ${failCount}개 삭제 실패` : ''}.`,
          severity: failCount > 0 ? 'warning' : 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: '자격 증명 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
      
      // 선택 항목 초기화
      table.onSelectAllRows(false, []);
      
      // 목록 새로고침
      fetchCredentials();
    } catch (err) {
      console.error('자격 증명 삭제 오류:', err);
      setSnackbar({
        open: true,
        message: '자격 증명 삭제 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 현재 페이지에 표시되는 행의 ID 목록 계산
  const visibleRows = dataFiltered
    .slice(
      table.page * table.rowsPerPage,
      table.page * table.rowsPerPage + table.rowsPerPage
    );
  
  const visibleRowIds = visibleRows.map(row => row.id.toString());

  // 전체 선택 핸들러 수정 - 현재 페이지의 행만 선택
  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      table.onSelectAllRows(true, visibleRowIds);
    } else {
      table.onSelectAllRows(false, []);
    }
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
          onDeleteSelected={handleOpenDeleteMultiDialog}
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
                    onSelectAllRows={handleSelectAllCurrentPage}
                    headLabel={[
                      { id: 'name', label: 'Name' },
                      { id: 'database_type', label: 'Database Type' },
                      { id: 'database_port', label: 'Port' },
                      { id: 'auth_type', label: 'Auth Type' },
                      { id: 'created', label: 'Created Date' },
                      { id: '' },
                    ]}
                    rowsPerPage={table.rowsPerPage}
                    page={table.page}
                    visibleRows={visibleRows.length}
                  />
                  <TableBody>
                    {visibleRows.map((row) => (
                      <CredentialTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id.toString())}
                        onSelectRow={() => table.onSelectRow(row.id.toString())}
                        onEditRow={handleEditCredential}
                        onDelete={handleDeleteCredential}
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
        credentialId={currentCredentialId}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDeleteConfirmDialog}
        onClose={handleCloseDeleteConfirmDialog}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          자격 증명 삭제 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            {credentialToDelete !== null
              ? '이 자격 증명을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
              : `선택한 ${table.selected.length}개의 자격 증명을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmDialog} color="inherit">
            취소
          </Button>
          <Button 
            onClick={handleDeleteSelectedCredentials} 
            color="error" 
            variant="contained" 
            autoFocus
          >
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