// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';

export const Health = AsyncHandler(async (_req, res) => {
  res.send('Server is Healthy and Ok ');
});
