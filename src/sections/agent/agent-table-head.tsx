import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

type AgentTableHeadProps = {
  orderBy: string;
  rowCount: number;
  numSelected: number;
  order: 'asc' | 'desc';
  onSort: (id: string) => void;
  headLabel: Record<string, any>[];
  onSelectAllRows: (checked: boolean) => void;
  rowsPerPage: number; // 페이지당 행 수 추가
  page: number; // 현재 페이지 번호 추가
  visibleRows: number; // 현재 페이지에 표시된 행 수 추가
};

export function AgentTableHead({
  order,
  onSort,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
  rowsPerPage,
  page,
  visibleRows,
}: AgentTableHeadProps) {
  // 현재 페이지의 항목만 고려하여 전체 선택 여부 계산
  const isAllSelected = visibleRows > 0 && numSelected === visibleRows;
  const isIndeterminate = numSelected > 0 && numSelected < visibleRows;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAllRows(event.target.checked);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={handleSelectAllClick}
          />
        </TableCell>

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}