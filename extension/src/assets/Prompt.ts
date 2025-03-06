export const Prompt = "Rewrite the following paragraph so that it is easier to understand for people with lower literacy. Use simple language, short sentences, and clear instructions. Avoid complex words, jargon, or long sentences. Break down the information into small chunks if needed, and add examples for clarity. Avoid adding extra comments, introductions, or explanations. Only provide the simplified version of the text. Here's the text:"
export const translatePrompt = "Translate the following text to the target language, stay true to the context.";
export const ReadModePrompts = [
  // Index 0: Very Complex (Flesch score < 30)
  `Rewrite the following text to have a Flesch Reading Ease score below 30 ("Very Complex"). 
   Use highly specialized or academic language, advanced vocabulary, and complex sentence structures. 
   Assume your audience is already familiar with technical terms. Here's the text:`,

  // Index 1: Complex (30–49)
  `Rewrite the following text to have a Flesch Reading Ease score between 30 and 49 ("Complex"). 
   Use a moderately sophisticated vocabulary and some complex sentence structures, 
   but ensure overall clarity for a well-educated or professional audience. Here's the text:`,

  // Index 2: Challenging (50–59)
  `Rewrite the following text to have a Flesch Reading Ease score between 50 and 59 ("Challenging"). 
   Include some advanced words and moderately complex sentence structures, 
   while maintaining a clear flow for readers at an advanced high-school or early-college level. Here's the text:`,

  // Index 3: Somewhat Challenging (60–69)
  `Rewrite the following text to have a Flesch Reading Ease score between 60 and 69 ("Somewhat Challenging"). 
   Balance clarity with a slightly elevated style. Use mostly straightforward language, 
   but you can include occasional technical terms or longer sentences. Here's the text:`,

  // Index 4: Moderately Accessible (70–79)
  `Rewrite the following text to have a Flesch Reading Ease score between 70 and 79 ("Moderately Accessible"). 
   Keep sentences mostly short and straightforward. Use clear, familiar vocabulary for a broad audience, 
   but allow for the occasional advanced word or phrase as needed. Here's the text:`,

  // Index 5: Accessible (80–89)
  `Rewrite the following text to have a Flesch Reading Ease score between 80 and 89 ("Accessible"). 
   Use mostly short sentences and everyday vocabulary. 
   Keep it easy for the majority of readers to understand without specialized knowledge. Here's the text:`,

  // Index 6: Highly Accessible (90+)
  `Rewrite the following text to have a Flesch Reading Ease score of 90 or higher ("Highly Accessible"). 
   Use very simple words, short sentences, and avoid complex or specialized language entirely. 
   The text should be easily understandable by almost anyone, regardless of reading level. Here's the text:`
];