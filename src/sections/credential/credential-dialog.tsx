import React, { useState, useEffect, ChangeEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

// API 서비스 임포트
import { CredentialService } from 'src/api/services';

// Props 타입 정의
interface CredentialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  credentialId?: string | number | null;
}

// Form Data 인터페이스
interface FormData {
  name: string;
  host: string;
  databaseType: string;
  authType: string;
  username: string;
  password: string;
  databasePort: string;
}

// Errors 인터페이스
interface FormErrors {
  username: boolean;
  databasePort: boolean;
}

export function CredentialDialog({ 
  open, 
  onClose, 
  onSuccess, 
  editMode = false, 
  credentialId = null 
}: CredentialDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    host: '',
    databaseType: 'Cubrid',
    authType: 'Password',
    username: '',
    password: '',
    databasePort: ''
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [errors, setErrors] = useState<FormErrors>({
    username: false,
    databasePort: false
  });

  // 데이터 로드 함수
  const loadCredentialData = async (id: string | number) => {
    setLoading(true);
    setApiError('');
    
    try {
      const response = await CredentialService.getById(id);
      console.log(response.status)
      if (response.status === "success" && response.credential) {
        const credential = response.credential;
        setFormData({
          name: credential.name || '',
          host: credential.host || '',
          databaseType: credential.database_type || '',
          authType: credential.auth_type || '',
          username: credential.username || '',
          password: credential.password || '',
          databasePort: credential.database_port ? String(credential.database_port) : ''
        });
      } else {
        setApiError('Failed to load credential data');
      }
    } catch (error) {
      console.error('Error loading credential:', error);
      setApiError('Error loading credential data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 또는 editMode/credentialId 변경 시 데이터 로드
  useEffect(() => {
    if (open) {
      if (editMode && credentialId) {
        loadCredentialData(credentialId);
      } else {
        // 새 크레덴셜 생성 시 폼 초기화
        setFormData({
          name: '',
          host: '',
          databaseType: 'Cubrid',
          authType: 'Password',
          username: '',
          password: '',
          databasePort: ''
        });
        setApiError('');
      }
    }
  }, [open, editMode, credentialId]);

  const handleChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value as string
    }));

    // Clear error when user types
    if (name && errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleNumericChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // 숫자만 허용
    if (value === '' || /^[0-9]+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
  
      // 필요한 경우 오류 상태도 초기화
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: false
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: !formData.username || 
                formData.username.length < 3 || 
                !/^[a-zA-Z0-9_-]+$/.test(formData.username),
      databasePort: !formData.databasePort || 
                    !/^\d+$/.test(formData.databasePort)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const data = {
        name: formData.name,
        host: formData.host,
        database_type: formData.databaseType,
        auth_type: formData.authType,
        username: formData.username,
        password: formData.password,
        database_port: formData.databasePort
      };
      
      let response;
      
      if (editMode && credentialId) {
        // 기존 크레덴셜 업데이트
        response = await CredentialService.update(credentialId, data);
      } else {
        // 새 크레덴셜 생성
        response = await CredentialService.create(data);
      }

      if (response && response.status === "success") {
        onSuccess();
        onClose();
      } else {
        setApiError('Failed to save credential');
      }
    } catch (error) {
      console.error('Error submitting credential:', error);
      setApiError('Error saving credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 영문자, 숫자, 언더스코어, 하이픈만 허용
    if (value === '' || /^[a-zA-Z0-9_-]*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        username: value
      }));
  
      // 사용자가 입력할 때 오류 상태 초기화
      setErrors(prev => ({
        ...prev,
        username: false
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editMode ? 'Edit Credential' : 'New Credential'}</DialogTitle>
      <DialogContent>
        {loading && !apiError && (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        )}
        
        {apiError && (
          <Box mt={2} mb={2}>
            <Typography color="error">{apiError}</Typography>
          </Box>
        )}
        
        {!loading && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter a name"
            />

            <TextField
              fullWidth
              margin="normal"
              label="Host"
              name="host"
              value={formData.host}
              onChange={handleChange}
              placeholder="Enter a host"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Database Type</InputLabel>
              <Select
                name="databaseType"
                value={formData.databaseType}
                onChange={handleChange as (event: SelectChangeEvent<string>) => void}
                label="Database Type"
              >
                <MenuItem value="Cubrid">Cubrid</MenuItem>
                <MenuItem value="MySQL">MySQL</MenuItem>
                <MenuItem value="PostgreSQL">PostgreSQL</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Auth Type</InputLabel>
              <Select
                name="authType"
                value={formData.authType}
                onChange={handleChange as (event: SelectChangeEvent<string>) => void}
                label="Auth Type"
              >
                <MenuItem value="Password">Password</MenuItem>
                <MenuItem value="SSH Key">SSH Key</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="Enter username"
              error={errors.username}
              helperText={errors.username ? "Username should be 3-30 characters and contain only letters, numbers, underscore, or hyphen" : ""}
              inputProps={{ 
                minLength: 3,
                maxLength: 30
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />

            <TextField
              fullWidth
              margin="normal"
              label="Database Port"
              name="databasePort"
              value={formData.databasePort}
              onChange={handleNumericChange}
              placeholder="Enter port"
              error={errors.databasePort}
              helperText={errors.databasePort ? "Invalid port" : ""}
              inputProps={{ 
                inputMode: 'numeric', 
                pattern: '[0-9]*' 
              }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button 
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Loading...' : (editMode ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// PropTypes 추가
CredentialDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  credentialId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};