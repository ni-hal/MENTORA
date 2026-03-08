const express = require('express');
const { summarize } = require('../controllers/llmController');
const { validateSummarize } = require('../validations/llmValidation');
// const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/summarize', validateSummarize, summarize);

module.exports = router;
