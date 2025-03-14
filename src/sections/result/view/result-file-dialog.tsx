import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box 
} from '@mui/material';

interface ResultFileDialogProps {
  open: boolean;
  fileName: string;
  fileContent: string;
  onClose: () => void;
}

export function ResultFileDialog({ 
  open, 
  fileName, 
  fileContent, 
  onClose 
}: ResultFileDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        파일 내용: {fileName}
      </DialogTitle>
      <DialogContent>
        <Box 
          sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            maxHeight: 500, 
            overflowY: 'auto' 
          }}
        >
          <Typography 
            variant="body2" 
            fontFamily="monospace" 
            whiteSpace="pre-wrap"
          >
            {fileContent || '파일 내용을 불러올 수 없습니다.'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}