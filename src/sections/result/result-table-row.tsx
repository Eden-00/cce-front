import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ResultProps = {
  id: string;
  agent: string;
  executionTime: string;
  field: string;
  subject: string;
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
  const handleViewFile = useCallback(() => {
    if (onViewFile) {
      // 파일명을 전체 파일명으로 전달
      onViewFile(`${row.agent}_${row.executionTime}_${row.field}_${row.subject}.xml`);
    }
  }, [onViewFile, row]);

  return (
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
  );
}