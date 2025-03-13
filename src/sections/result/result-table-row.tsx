import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ResultProps = {
  id: string;
  agent: string;
  executionTime: string;
  field: string; // 항목 필드 추가
  subject: string; // 항목 필드 추가
  fileName: string;
  status: string;
  [key: string]: any; // 추가 속성 허용
};

type ResultTableRowProps = {
  row: ResultProps;
  selected: boolean;
  onSelectRow: () => void;
  onViewFile?: (fileName: string) => void;
};

export function ResultTableRow({ 
  row, 
  selected, 
  onSelectRow, 
  onViewFile 
}: ResultTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleViewFile = useCallback(() => {
    if (onViewFile) {
      onViewFile(row.fileName);
    }
  }, [onViewFile, row.fileName]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          {row.agent}
        </TableCell>

        <TableCell>{row.executionTime}</TableCell>
        
        <TableCell>{row.field}</TableCell>

        <TableCell>{row.subject}</TableCell>

        <TableCell>{row.fileName}</TableCell>

        <TableCell>
          <Label color={(row.status === 'failed' && 'error') || 'success'}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="eva:file-text-outline" />}
            onClick={handleViewFile}
          >
            파일 내용 보기
          </Button>
        </TableCell>
      </TableRow>

    </>
  );
}