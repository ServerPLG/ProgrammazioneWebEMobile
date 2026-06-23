const express = require('express');
const router = express.Router();
const miscController = require('../controllers/miscController');

router.get('/server-ip', miscController.getServerIp);

module.exports = router;
