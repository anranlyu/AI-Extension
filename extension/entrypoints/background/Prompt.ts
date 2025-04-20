export const translatePrompt = (targetLanguage: string) => `Translate the following text to ${targetLanguage}. Stay true to the original context and meaning. Do not add any comments, introductions, or explanations.`;
export const ReadingLevelAdjustmentPrompts = [
  // Index 0: Very Complex (Flesch score < 30)
  `You are an expert writer focusing on advanced academic or technical language.
   Rewrite the following text to have a Flesch Reading Ease score below 30 ("Very Complex").
   
   **Important guidelines**:
   1. Use highly specialized or academic vocabulary.
   2. Incorporate complex sentence structures (multiple clauses, lengthy paragraphs).
   3. Maintain the original meaning and context, but elevate the style to be more scholarly.
   4. Do not simplify terms; instead, lean into technical or field-specific jargon where appropriate.
   5. Keep the tone formal and objective.
   6. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `,

  // Index 1: Complex (Flesch score 30–49)
  `You are an expert writer with a focus on sophisticated communication.
   Rewrite the text to have a Flesch Reading Ease score between 30 and 49 ("Complex").

   **Important guidelines**:
   1. Use moderately advanced vocabulary and varied sentence structures.
   2. Ensure the tone remains formal or semi-formal, with a professional feel.
   3. Preserve all key details and context from the original text.
   4. Avoid unnecessary jargon, but do not overly simplify either.
   5. Aim for a level suitable for well-educated or professional readers.
   6. Do not add any comments, introductions, or explanations.
   7. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `,

  // Index 2: Challenging (Flesch score 50–59)
  `You are an experienced writer aiming for a higher-level reader.
   Rewrite the text to have a Flesch Reading Ease score between 50 and 59 ("Challenging").

   **Important guidelines**:
   1. Maintain a mostly formal style, but you can include some conversational elements.
   2. Keep sentences moderately complex; vary length but ensure logical flow.
   3. Use some advanced vocabulary while preserving overall clarity.
   4. Retain the original meaning, context, and tone as much as possible.
   5. Do not add any comments, introductions, or explanations.
   6. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `,

  // Index 3: Somewhat Challenging (Flesch score 60–69)
  `You are an experienced writer aiming for a broad but educated audience.
   Rewrite the text to have a Flesch Reading Ease score between 60 and 69 ("Somewhat Challenging").

   **Important guidelines**:
   1. Keep language mostly straightforward, but allow occasional technical or advanced terms.
   2. Use sentence structures that are clear, with some variation in length.
   3. Ensure the main ideas are well-organized and easy to follow.
   4. Maintain important details, context, and overall tone.
   5. Do not add any comments, introductions, or explanations.
   6. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `,

  // Index 4: Moderately Accessible (Flesch score 70–79)
  `You are a skilled communicator aiming for a broad general audience.
   Rewrite the text to have a Flesch Reading Ease score between 70 and 79 ("Moderately Accessible").

   **Important guidelines**:
   1. Use mostly short, direct sentences with a few moderate-length sentences for variety.
   2. Employ familiar vocabulary, with occasional advanced words if truly needed.
   3. Keep paragraphs well-structured and focused.
   4. Preserve the original meaning, but make the content more approachable.
   5. Do not add any comments, introductions, or explanations.
   6. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `,

  // Index 5: Accessible (Flesch score 80–89)
  `You are a clear and concise writer focusing on easy readability.
   Rewrite the text to have a Flesch Reading Ease score between 80 and 89 ("Accessible").

   **Important guidelines**:
   1. Use everyday language and keep sentences short to moderate in length.
   2. Provide clear transitions and simple explanations for any complex ideas.
   3. Maintain the key points, but remove any unnecessary complexity or jargon.
   4. Preserve the overall tone and intent.
   5. Do not add any comments, introductions, or explanations.
   6. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `,

  // Index 6: Highly Accessible (Flesch score ≥ 90)
  `You are a plain-language specialist aiming for very high readability.
   Rewrite the text to have a Flesch Reading Ease score of 90 or higher ("Highly Accessible").

   **Important guidelines**:
   1. Use very simple words and short, direct sentences.
   2. Avoid technical jargon or specialized terms; if necessary, explain them briefly.
   3. Ensure the text can be understood by readers of almost any level.
   4. Keep the tone friendly, straightforward, and supportive.
   5. Do not add any comments, introductions, or explanations.
   6. Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.

   **TEXT TO REWRITE**:
   `
];
// Length adjustment prompts for different options
export const LengthAdjustmentPrompts = [

  // Option 0: Shorter
  `Condense this text to approximately 60-70% of its original length.
   Remove redundancies and less essential information while preserving all key points, main arguments, and critical details.
   Prioritize clarity and conciseness while maintaining the original meaning.
   Do not add any comments, introductions, or explanations.
   Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.
   `,
  
  // Option 1: Shortest
  `Summarize this text to approximately 40-50% of its original length.
   Focus only on the most essential information, main arguments, and key points.
   Eliminate details, examples, and explanations that aren't absolutely necessary.
   Prioritize brevity while ensuring the core message remains clear and accurate.
   Do not add any comments, introductions, or explanations.
   Please deliver the response in plain text without any Markdown or formatting. Provide the output as raw text.
   `
];