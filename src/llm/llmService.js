const axios = require('axios');
const AppError = require('../utils/AppError');

const summarizeText = async (text) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    return `• ${text.substring(0, 10)}...\n• This is a mock summary for testing\n• Replace GEMINI_API_KEY with valid key for real summaries`;
  }

  const models = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro' ,'Gemini-3-Flash'];
  
  for (const model of models) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following text into 3-6 concise bullet points:\n\n${text}`
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(`Gemini API Error (${model}):`, error.response?.data || error.message);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError('Invalid Gemini API key', 502);
      }
      if (error.response?.status === 429) {
        throw new AppError('Gemini API rate limit exceeded', 502);
      }
      if (error.response?.status === 503 && model !== models[models.length - 1]) {
        continue;
      }
      throw new AppError(`Failed to generate summary: ${error.response?.data?.error?.message || error.message}`, 502);
    }
  }
};

module.exports = { summarizeText };
