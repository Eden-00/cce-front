import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

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

type CredentialTableRowProps = {
  row: CredentialProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: (row: CredentialProps) => void;
  onDelete?: (id: number) => void; // 삭제 핸들러 추가
};

export function CredentialTableRow({ row, selected, onSelectRow, onEditRow, onDelete }: CredentialTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleOpenDeleteDialog = () => {
    handleClosePopover();
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(row.id);
    }
    handleCloseDeleteDialog();
  };

  const handleEdit = useCallback(() => {
    onEditRow(row);
    handleClosePopover();
  }, [onEditRow, row, handleClosePopover]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Typography variant="subtitle2">{row.name}</Typography>
        </TableCell>

        <TableCell>{row.database_type}</TableCell>

        <TableCell>{row.database_port}</TableCell>

        <TableCell>
          <Chip 
            label={row.auth_type}
            size="small"
            color={row.auth_type === 'Password' ? 'primary' : 'default'}
            variant="outlined"
          />
        </TableCell>

        <TableCell>{formatDate(row.created)}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          자격 증명 삭제 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            선택한 자격 증명을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            취소
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}