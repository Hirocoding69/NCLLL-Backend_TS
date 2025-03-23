import { Router } from 'express';

const router = Router();

import BannerRoutes from './banner';
import TagRoutes from './tag';
import GavormentRoutes from './govern-member';
import MinistryRoutes from './ministry';

router
    .use('/govern-members', GavormentRoutes)
    .use('/ministries', MinistryRoutes)
    .use('/tags', TagRoutes)
    .use('/banners', BannerRoutes);

export default router;
