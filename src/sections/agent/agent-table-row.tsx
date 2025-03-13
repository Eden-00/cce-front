import { useState } from 'react';

import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import { fToNow } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// 명시적으로 내보냅니다
export interface AgentProps {
  id: string;
  name: string;
  os: string;
  osVersion: string;
  ipAddress: string;
  purpose: string;
  admin: string;
  tags: string[];
  status: string;
  agent_id: string;
  last_active: string | null;
}

interface AgentTableRowProps {
  row: AgentProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: () => void;
  onDelete?: (agent_id: string) => void; // 삭제 핸들러 추가
}

// OS에 따른 아이콘 매핑 함수
const getOsIcon = (os: string): string => {
  const osLower = os.toLowerCase();
  
  if (osLower.includes('windows')) return 'mdi:microsoft-windows';
  if (osLower.includes('mac') || osLower.includes('darwin')) return 'mdi:apple';
  if (osLower.includes('linux')) return 'mdi:linux';
  if (osLower.includes('ubuntu')) return 'mdi:ubuntu';
  if (osLower.includes('android')) return 'mdi:android';
  if (osLower.includes('ios')) return 'mdi:apple-ios';
  
  // 기본 아이콘
  return 'mdi:desktop-classic';
};

export function AgentTableRow({
  row,
  selected,
  onSelectRow,
  onEdit,
  onDelete,
}: AgentTableRowProps) {
  const { name, status, os, osVersion, ipAddress, tags, admin, purpose } = row;

  const [openMenu, setOpenMenu] = useState<HTMLButtonElement | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleOpenDeleteDialog = () => {
    handleCloseMenu();
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(row.agent_id);
    }
    handleCloseDeleteDialog();
  };

  // OS에 맞는 아이콘 가져오기
  const osIcon = getOsIcon(os);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon={osIcon} width={20} height={20} sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {os} {osVersion ? `/ ${osVersion}` : ''}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {ipAddress}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {purpose}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {admin}
          </Typography>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                태그 없음
              </Typography>
            )}
          </Box>
        </TableCell>

        <TableCell>
          <Chip
            label={status}
            size="small"
            color={
              (status === 'online' && 'success') ||
              (status === 'idle' && 'warning') ||
              'error'
            }
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {row.last_active ? fToNow(row.last_active) : 'Never'}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openMenu}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
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
          <MenuItem onClick={() => {
            onEdit();
            handleCloseMenu();
          }}>
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
          에이전트 삭제 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            &ldquo;{name}&rdquo; 에이전트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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