import { Request, Response } from 'express';

import { getHomePageContent } from '../services/home.service';
import { sendSuccess } from '../utils/api-response';

export const getHomePageController = async (_req: Request, res: Response): Promise<void> => {
  const content = await getHomePageContent();
  sendSuccess(res, 200, 'Home page content fetched successfully', content);
};
