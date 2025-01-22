import { Router } from 'express';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../utils/validation';
import { register, login } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import type { Response, RequestHandler } from 'express';

const router = Router();

interface ProfileResponse {
  status: 'success';
  data: {
    user: AuthRequest['user'];
  };
}

interface AuthResponse extends ApiResponse {
  // ...
}

const profileHandler: RequestHandler = (req, res: Response<ProfileResponse>) => {
  const authReq = req as AuthRequest;
  res.json({
    status: 'success',
    data: { user: authReq.user }
  });
};

router.post('/register', validate(registerSchema), register as RequestHandler);
router.post('/login', validate(loginSchema), login as RequestHandler);
router.get('/profile', authenticate, profileHandler);

export default router; 