import { Hono } from 'hono'
import { requireOwner } from '../../middleware/require-owner'
import type { AppEnv } from '../../types'
import { adminAttemptRoutes } from './attempts'
import { adminQuizRoutes } from './quizzes'
import { adminSusRoutes } from './sus'

export const adminRoutes = new Hono<AppEnv>()

adminRoutes.use('*', requireOwner)
adminRoutes.route('/quizzes', adminQuizRoutes)
adminRoutes.route('/attempts', adminAttemptRoutes)
adminRoutes.route('/sus', adminSusRoutes)
