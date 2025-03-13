import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type AgentProps = {
  id: string;
  name: string;
  os: string;
  osVersion: string;
  ipAddress: string;
  purpose: string;
  admin: string;
  last_active: string | null;
  tags: string[];
  status: string;
};

type AgentTableRowProps = {
  row: AgentProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit?: (agent: AgentProps) => void;
  onRefresh?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
};

export function AgentTableRow({ 
  row, 
  selected, 
  onSelectRow, 
  onEdit, 
  onRefresh, 
  onDelete 
}: AgentTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(row);
    }
    setOpenPopover(null);
  }, [onEdit, row]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(row.id);
    }
    setOpenPopover(null);
  }, [onDelete, row.id]);

  // 운영체제에 따른 아이콘 선택
  const getOsIcon = (os: string) => {
    const osLower = os.toLowerCase();
    if (osLower.includes('windows')) return 'mdi:microsoft-windows';
    if (osLower.includes('mac') || osLower.includes('osx')) return 'mdi:apple';
    if (osLower.includes('linux') || osLower.includes('ubuntu') || osLower.includes('centos')) return 'mdi:linux';
    return 'mdi:desktop-classic';
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>
            {row.name}
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Iconify icon={getOsIcon(row.os)} width={24} height={24} />
            {row.os} {row.osVersion}
          </Box>
        </TableCell>

        <TableCell>{row.ipAddress}</TableCell>

        <TableCell>{row.purpose}</TableCell>

        <TableCell>{row.admin}</TableCell>

        <TableCell>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {row.tags.map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined" 
                sx={{ margin: '2px' }}
              />
            ))}
          </Stack>
        </TableCell>

        <TableCell>
          <Label 
            color={(row.status === 'offline' && 'error') || 
                  (row.status === 'idle' && 'warning') || 
                  'success'}
          >
            {row.status}
          </Label>
        </TableCell>

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

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}