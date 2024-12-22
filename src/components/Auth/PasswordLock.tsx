import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Alert
} from '@mui/material';

interface PasswordLockProps {
  isOpen: boolean;
  onUnlock: () => void;
}

const PasswordLock = ({ isOpen, onUnlock }: PasswordLockProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const CORRECT_PASSWORD = '2240'; // 実際のアプリではenv等で管理
  const MAX_ATTEMPTS = 3;
  const LOCK_TIME = 30; // 30秒

  useEffect(() => {
    let timer: number;
    if (isLocked && lockTimer > 0) {
      timer = window.setInterval(() => {
        setLockTimer((prev) => prev - 1);
      }, 1000);
    }
    if (lockTimer === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockTimer]);

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setError(false);
      setPassword('');
      setAttempts(0);
      onUnlock();
    } else {
      setError(true);
      setPassword('');
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockTimer(LOCK_TIME);
        }
        return newAttempts;
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => {}} disableEscapeKeyDown>
      <DialogTitle>パスワードを入力してください</DialogTitle>
      <DialogContent>
        {isLocked ? (
          <Alert severity="error">
            試行回数が上限を超えました。{lockTimer}秒後に再試行できます。
          </Alert>
        ) : (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="パスワード"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              helperText={error ? 'パスワードが正しくありません' : ''}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {attempts > 0 && (
              <Alert severity="warning">
                残り試行回数: {MAX_ATTEMPTS - attempts}回
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handlePasswordSubmit}
          disabled={isLocked || !password}
          color="primary"
        >
          確認
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordLock; 