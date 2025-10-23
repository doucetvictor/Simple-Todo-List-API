const express = require('express');

const router = express.Router();

router.use('/', require('./create'));
router.use('/', require('./delete'));
router.use('/', require('./retrieve'));
router.use('/', require('./update'));

module.exports = router;
