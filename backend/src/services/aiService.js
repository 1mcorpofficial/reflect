/**
 * AI Service for processing text responses
 * Supports OpenAI and can be extended to support other providers
 */

// Mock AI service for now (can be replaced with actual OpenAI/Claude integration)
// In production, this would use OpenAI API or Claude API

const annotateText = async (questionText, answerText, options = {}) => {
  // For MVP, we'll use a simple rule-based approach
  // In production, replace with actual AI API call
  
  const aiModel = options.model || 'mock-v1';
  
  try {
    // Simple mock implementation
    // In production, this would call OpenAI/Claude API:
    /*
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `Analizuok šį atsakymą į klausimą ir pateik JSON formatu.
Klausimas: ${questionText}
Atsakymas: ${answerText}

JSON formatas:
{
  "topic": "pagrindinė tema",
  "emotion": "positive|neutral|negative|mixed",
  "intensity": 1-10,
  "suggestionType": "help_needed|clarification|encouragement|complaint|question|feedback|none",
  "summary": "trumpa santrauka",
  "actionHint": "veiksmo užuomina",
  "keywords": ["raktinis", "žodis"]
}`;

    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    */

    // Mock implementation for MVP
    const text = answerText.toLowerCase();
    
    // Detect emotion
    let emotion = 'neutral';
    let intensity = 5;
    if (text.includes('gerai') || text.includes('puiku') || text.includes('patinka') || text.includes('džiaugiuosi')) {
      emotion = 'positive';
      intensity = 7;
    } else if (text.includes('blogai') || text.includes('sunku') || text.includes('nesuprantu') || text.includes('problema')) {
      emotion = 'negative';
      intensity = 6;
    } else if (text.includes('sunku') && text.includes('bet')) {
      emotion = 'mixed';
      intensity = 5;
    }

    // Detect suggestion type
    let suggestionType = 'none';
    if (text.includes('pagalba') || text.includes('padėk') || text.includes('reikia')) {
      suggestionType = 'help_needed';
    } else if (text.includes('neaišku') || text.includes('nepasakyk') || text.includes('paaiškink')) {
      suggestionType = 'clarification';
    } else if (text.includes('ačiū') || text.includes('dėkoju')) {
      suggestionType = 'encouragement';
    } else if (text.includes('skundas') || text.includes('problema') || text.includes('blogai')) {
      suggestionType = 'complaint';
    } else if (text.includes('?')) {
      suggestionType = 'question';
    } else if (text.length > 50) {
      suggestionType = 'feedback';
    }

    // Extract keywords (simple word frequency - in production, use NLP)
    const words = text.split(/\s+/).filter(w => w.length > 3);
    const keywordCount = {};
    words.forEach(word => {
      keywordCount[word] = (keywordCount[word] || 0) + 1;
    });
    const keywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // Generate summary (first 100 chars in mock - in production, AI would generate)
    const summary = answerText.length > 100 
      ? answerText.substring(0, 100) + '...'
      : answerText;

    // Generate action hint
    let actionHint = '';
    if (suggestionType === 'help_needed') {
      actionHint = 'Mokinys prašo pagalbos - reikėtų susisiekti';
    } else if (suggestionType === 'clarification') {
      actionHint = 'Reikia papildomo aiškinimo';
    } else if (emotion === 'negative' && intensity > 7) {
      actionHint = 'Aukštas neigiamų emocijų lygis - verta įvertinti situaciją';
    } else if (emotion === 'positive') {
      actionHint = 'Teigiamas atsakymas - galima paskatinti toliau';
    }

    // Detect topic (simple keyword matching - in production, use topic modeling)
    let topic = 'bendrasis';
    if (text.includes('namų') || text.includes('darbai') || text.includes('užduotis')) {
      topic = 'namų darbai';
    } else if (text.includes('mokytojas') || text.includes('pamoka')) {
      topic = 'mokymasis';
    } else if (text.includes('klasė') || text.includes('draugai')) {
      topic = 'socialinis';
    } else if (text.includes('jausmas') || text.includes('jausiuosi')) {
      topic = 'emocinė būsena';
    }

    return {
      topic,
      emotion,
      intensity,
      suggestionType,
      summary,
      actionHint,
      keywords,
      confidence: 0.7, // Mock confidence
    };
  } catch (error) {
    console.error('AI annotation error:', error);
    throw error;
  }
};

/**
 * Process a text response and create AI annotation
 */
const processTextResponse = async (responseId, questionId, questionText, answerText, options = {}) => {
  const AIAnnotation = require('../models/AIAnnotation');
  
  try {
    // Check if annotation already exists
    const existing = await AIAnnotation.findOne({ responseId, questionId });
    if (existing && existing.status === 'completed') {
      return existing;
    }

    // Create or update annotation with pending status
    const annotation = existing || new AIAnnotation({
      responseId,
      questionId,
      originalText: answerText,
      status: 'processing',
    });
    
    annotation.status = 'processing';
    await annotation.save();

    // Call AI service
    const annotations = await annotateText(questionText, answerText, options);
    
    // Update annotation
    annotation.annotations = annotations;
    annotation.aiModel = options.model || 'mock-v1';
    annotation.status = 'completed';
    annotation.processedAt = new Date();
    annotation.version = (annotation.version || 0) + 1;
    await annotation.save();

    return annotation;
  } catch (error) {
    console.error('Process text response error:', error);
    
    // Update annotation with error status
    try {
      const AIAnnotation = require('../models/AIAnnotation');
      const annotation = await AIAnnotation.findOne({ responseId, questionId });
      if (annotation) {
        annotation.status = 'failed';
        annotation.errorMessage = error.message;
        await annotation.save();
      }
    } catch (updateError) {
      console.error('Failed to update annotation error status:', updateError);
    }
    
    throw error;
  }
};

/**
 * Batch process multiple text responses
 */
const batchProcessTextResponses = async (responses, options = {}) => {
  const results = [];
  
  for (const response of responses) {
    try {
      const result = await processTextResponse(
        response.responseId,
        response.questionId,
        response.questionText,
        response.answerText,
        options
      );
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  annotateText,
  processTextResponse,
  batchProcessTextResponses,
};

