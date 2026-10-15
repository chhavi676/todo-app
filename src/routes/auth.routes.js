const router = require('express').Router();
const authController = require('../controllers/auth.controller')

router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback)

module.exports = router;