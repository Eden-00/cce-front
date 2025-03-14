import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

type CredentialTableHeadProps = {
  orderBy: string;
  rowCount: number;
  numSelected: number;
  order: 'asc' | 'desc';
  onSort: (id: string) => void;
  headLabel: Record<string, any>[];
  onSelectAllRows: (checked: boolean) => void;
  rowsPerPage?: number; // 추가: 페이지당 행 수 (옵션)
  page?: number; // 추가: 현재 페이지 (옵션)
  visibleRows?: number; // 추가: 현재 보이는 행 수 (옵션)
};

export function CredentialTableHead({
  order,
  onSort,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
  rowsPerPage, // 추가
  page, // 추가
  visibleRows, // 추가
}: CredentialTableHeadProps) {
  // 체크박스 동작 계산을 개선할 수 있음 (페이지별 선택 지원)
  const isAllSelected = rowCount > 0 && numSelected === rowCount;
  const isIndeterminate = numSelected > 0 && numSelected < rowCount;
  
  // 현재 페이지에서만 모든 항목 선택 기능을 구현하려면 여기서 활용
  const isAllCurrentPageSelected = visibleRows && numSelected === visibleRows;
  
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && (visibleRows ? numSelected < visibleRows : numSelected < rowCount)}
            checked={visibleRows ? (visibleRows > 0 && numSelected === visibleRows) : (rowCount > 0 && numSelected === rowCount)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSelectAllRows(event.target.checked)
            }
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