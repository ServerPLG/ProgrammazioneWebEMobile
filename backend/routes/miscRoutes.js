const router = require('express').Router();
const c = require('../controllers/miscController');

router.get('/server-ip', c.getServerIp);

module.exports = router;
