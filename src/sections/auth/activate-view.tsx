import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ActivateView() {
  
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleActivate = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end">
      <TextField
        fullWidth
        name="email"
        label="Email address"
        defaultValue="paradox@findthegap.co.kr"
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="ActivationCode"
        label="Activation Code"
        defaultValue="FTGAP-12345-ABCDE-67890"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleActivate}
      >
        Activate
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Activate</Typography>
      </Box>
      
          {/* Explanation text */}
          <Box sx={{ mb: 5, width: '100%' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
              Activation Code는<br />
              파인더갭 관리자에게 제공받아야 합니다.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Activation이 종료되면 한달간 데이터를 보관 후 삭제됩니다.
            </Typography>
          </Box>

      {renderForm}
    </>
  );
}
