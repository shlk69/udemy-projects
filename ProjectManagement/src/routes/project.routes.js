import validate from '../middlewares/validator.middleware.js'
import {
    createProjectValidator,addMemberToProjectValidato
} from '../validators/index.js'

import {
    getProjects,
    getProjectById,
    getProjectMembers,
    createProject,
    deleteMember,
    deleteProject,
    addMembersToProject,
    updateMemberRole,
    updateProject
} from '../controllers/project.controllers.js'


import { verifyJWT, validateProjectPermission } from '../middlewares/auth.middleware.js'
import  Router  from 'express'
import { AvailableUSerRoles, UserRolesEnum } from '../utils/constants.js'
const router = Router()


router.use(verifyJWT)
router
    .route('/')
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject)


router
    .route('/:projectId')
    .get(validateProjectPermission(AvailableUSerRoles),getProjectById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject
    )


router
    .route('/:projectId/members')
    .get(getProjectMembers)
    .post(
    validateProjectPermission([UserRolesEnum.ADMIN],addMemberToProjectValidato(),validate,addMembersToProject)
)


router.route('/:projectId/members/userId')
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateMemberRole
)
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteMember
    )



export default router