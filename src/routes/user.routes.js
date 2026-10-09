const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middlewares/auth.middleware");

router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.patch('/update/:id',authMiddleware, userController.updateUser);
router.delete('/delete/:id',authMiddleware, userController.deleteUser);

module.exports = router