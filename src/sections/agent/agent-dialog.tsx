import { useState, useEffect, ChangeEvent } from 'react';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { AgentProps } from './agent-table-row';

// ----------------------------------------------------------------------

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AVAILABLE_TAGS = [
  'DATABASE',
  'PC',
  'SERVER',
  'WAS',
  'WEB'
];

// 에러 상태를 위한 인터페이스
interface FormErrors {
  [key: string]: string | null;
}

// AgentDialog 컴포넌트의 props 인터페이스
interface AgentDialogProps {
  open: boolean;
  onClose: () => void;
  agent: AgentProps | null;
  onSave: (data: AgentProps) => void;
}

// 폼 데이터 인터페이스
interface FormData {
  name: string;
  os: string;
  osVersion: string;
  ipAddress: string;
  purpose: string;
  admin: string;
  tags: string[];
  status: string;
}

// ----------------------------------------------------------------------

export default function AgentDialog({ open, onClose, agent = null, onSave }: AgentDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    os: '',
    osVersion: '',
    ipAddress: '',
    purpose: '',
    admin: '',
    tags: [],
    status: 'offline'
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 에이전트 정보가 전달되면 폼 데이터 초기화
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        os: agent.os || '',
        osVersion: agent.osVersion || '',
        ipAddress: agent.ipAddress || '',
        purpose: agent.purpose || '',
        admin: agent.admin || '',
        tags: agent.tags || [],
        status: agent.status || 'offline'
      });
    } else {
      // 새 에이전트인 경우 폼 초기화
      setFormData({
        name: '',
        os: '',
        osVersion: '',
        ipAddress: '',
        purpose: '',
        admin: '',
        tags: [],
        status: 'offline'
      });
    }
    // 에러 상태 초기화
    setErrors({});
  }, [agent, open]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // 값이 입력되면 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      tags: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '에이전트 이름을 입력해주세요';
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = '용도를 입력해주세요';
    }
    
    if (!formData.admin.trim()) {
      newErrors.admin = '관리자 정보를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // 변경 불가능한 필드를 원래 값으로 유지
      const submittedData = {
        id: agent?.id || '', // ID가 없는 경우 빈 문자열 (새 에이전트)
        ...formData,
        os: agent ? agent.os : formData.os,
        osVersion: agent ? agent.osVersion : formData.osVersion,
        ipAddress: agent ? agent.ipAddress : formData.ipAddress,
        status: agent ? agent.status : formData.status
      };
      
      onSave(submittedData as AgentProps);
      onClose();
    }
  };

  // 상태에 따른 색상 선택
  const getStatusColor = (status: string): string => {
    if (status === 'online') return 'success.main';
    if (status === 'offline') return 'error.main';
    if (status === 'idle') return 'warning.main';
    return 'text.primary';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{agent ? '에이전트 정보 수정' : '새 에이전트 추가'}</DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 시스템 정보 섹션 (변경 불가) */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              시스템 정보 (변경 불가)
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="운영체제"
              value={formData.os}
              InputProps={{ readOnly: true }}
              disabled
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="OS 버전"
              value={formData.osVersion}
              InputProps={{ readOnly: true }}
              disabled
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IP 주소"
              value={formData.ipAddress}
              InputProps={{ readOnly: true }}
              disabled
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="에이전트 이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled
            />
          </Grid>

          {/* 추가 정보 섹션 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              추가 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="용도"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              error={!!errors.purpose}
              helperText={errors.purpose}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="관리자"
              name="admin"
              value={formData.admin}
              onChange={handleChange}
              error={!!errors.admin}
              helperText={errors.admin}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="tags-label">태그</InputLabel>
              <Select
                labelId="tags-label"
                multiple
                name="tags"
                value={formData.tags}
                onChange={handleTagChange}
                input={<OutlinedInput label="태그" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {AVAILABLE_TAGS.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">취소</Button>
        <Button onClick={handleSubmit} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}