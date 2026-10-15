const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require('../middlewares/validation.middleware');
const userValidation = require('../validations/user.validation');

router.post('/', validate(userValidation.createUser), userController.createUser);
router.post('/login', validate(userValidation.loginUser), userController.loginUser);
router.patch(
    '/update/:id',
    authMiddleware,
    validate(userValidation.userId, 'params'),
    validate(userValidation.updateUser),
    userController.updateUser
);
router.delete(
    '/delete/:id',
    authMiddleware,
    validate(userValidation.userId, 'params'),
    userController.deleteUser
);

router.delete('/logout', authMiddleware, userController.logoutUser)

module.exports = router