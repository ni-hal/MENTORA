const { summarizeText } = require('../llm/llmService');

const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;

    const summary = await summarizeText(text);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      success: true,
      message: 'Text summarized successfully',
      data: {
        originalLength: text.length,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { summarize };
