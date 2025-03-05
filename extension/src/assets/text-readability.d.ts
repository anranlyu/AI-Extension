declare module 'text-readability' {
  class Readability {
    static getGradeSuffix(grade: number): string
    charCount(text: string, ignoreSpaces?: boolean): number
    letterCount(text: string, ignoreSpaces?: boolean): number
    removePunctuation(text: string): string
    static split(text: string): string[]
    lexiconCount(text: string, removePunctuation?: boolean): number
    syllableCount(text: string, lang?: string): number
    sentenceCount(text: string): number
    averageSentenceLength(text: string): number
    averageSyllablePerWord(text: string): number
    averageCharacterPerWord(text: string): number
    averageLetterPerWord(text: string): number
    averageSentencePerWord(text: string): number
    fleschReadingEase(text: string): number
    fleschReadingEaseToGrade(score: number): number
    fleschKincaidGrade(text: string): number
    polySyllableCount(text: string): number
    smogIndex(text: string): number
    colemanLiauIndex(text: string): number
    automatedReadabilityIndex(text: string): number
    linsearWriteFormula(text: string): number
    presentTense(word: string): string
    difficultWords(text: string, syllableThreshold?: number): number
    difficultWordsSet(text: string, syllableThreshold?: number): Set<string>
    daleChallReadabilityScore(text: string): number
    daleChallToGrade(score: number): number
    gunningFog(text: string): number
    lix(text: string): number
    rix(text: string): number
    textStandard(text: string, floatOutput?: boolean): number | string
    textMedian(text: string): number
  }

  const readability: Readability

  export default readability
}