const router = require('express').Router();

// Ye routes sirf HTML page dikhate hain. Asli login/signup ka kaam
// browser ka JavaScript (public/js/auth.js) API ko call karke karta hai.

router.get('/', (req, res) => res.redirect('/login'));

router.get('/login', (req, res) => {
    res.render('login', { title: 'Sign In' });
});

router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Create Account' });
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Home' });
});

module.exports = router;
