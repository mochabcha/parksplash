const blockedTerms = ['damn', 'hell', 'shit', 'fuck'];

export const containsBlockedLanguage = (value: string) =>
  blockedTerms.some((term) => value.toLowerCase().includes(term));
