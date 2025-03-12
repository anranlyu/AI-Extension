function calculateFlesch(
  totalSentences: number,
  totalWords: number,
  totalSyllables: number
): number {
  let readingLevel = 0;

  // Guard against division by zero
  if (totalSentences !== 0 && totalWords !== 0) {
    readingLevel = 206.835 
                   - 1.015 * (totalWords / totalSentences) 
                   - 84.6 * (totalSyllables / totalWords);
  }

  // Convert numeric readingLevel into an index for ReadabilityLabels
  if (readingLevel < 30) {
    return 0; // 'Very Complex'
  } else if (readingLevel < 50) {
    return 1; // 'Complex'
  } else if (readingLevel < 60) {
    return 2; // 'Challenging'
  } else if (readingLevel < 70) {
    return 3; // 'Somewhat Challenging'
  } else if (readingLevel < 80) {
    return 4; // 'Moderately Accessible'
  } else if (readingLevel < 90) {
    return 5; // 'Accessible'
  } else {
    return 6; // 'Highly Accessible'
  }
}

function getSyllables(word: string): number {
  // Convert to lowercase
  let w = word.toLowerCase();
  
  // Remove non-alpha characters (punctuation, numbers, etc.)
  w = w.replace(/[^a-z]/g, '');

  // If the (cleaned) word is very short, assume at least 1 syllable
  if (w.length <= 3) {
    return 1;
  }

  // Remove certain trailing syllable-grabbing endings
  // (e.g., trailing 'e' in "cake", 'es' in "wishes", 'ed' in "turned")
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  
  // Strip starting 'y', as in "yours" => "ours"
  w = w.replace(/^y/, '');

  // Count vowel groups
  const syllableGroups = w.match(/[aeiouy]{1,2}/g);
  return syllableGroups ? syllableGroups.length : 0;
}

export function getFleschReadingEase(text: string): number {
  // Split into sentences by ., !, or ?
  // + handles multiple punctuation marks in a row (e.g., "Hello!!")
  // Filter out any empty strings after the split
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let totalWords = 0;
  let totalSyllables = 0;

  // Split each sentence on whitespace to get words
  sentences.forEach(sentence => {
    // Split on one or more whitespace characters
    const words = sentence
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    words.forEach(w => {
      totalWords++;
      totalSyllables += getSyllables(w);
    });
  });

  const totalSentences = sentences.length;
  return calculateFlesch(totalSentences, totalWords, totalSyllables);
}

