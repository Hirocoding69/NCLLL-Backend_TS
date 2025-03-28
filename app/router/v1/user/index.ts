import { Router } from 'express';

const router = Router();

import BannerRoutes from './banner';
import TagRoutes from './tag';
import GavormentRoutes from './govern-member';
import MinistryRoutes from './ministry';
import ResourceRoutes from './resource';
import BlogRoutes from './blog';
router
    .use('/govern-members', GavormentRoutes)
    .use('/ministries', MinistryRoutes)
    .use('/tags', TagRoutes)
    .use('/banners', BannerRoutes)
    .use('/resources', ResourceRoutes)
    .use('/blogs', BlogRoutes);

export default router;
