type BuildConsistencyPromptProps = {
    prompt: string;
  
    dna?: string;
  
    visualSignature?: string;
  
    styleMemory?: string;
  
    favoritePromptStyle?: string;
  };
  
  function safeText(value?: string): string {
    if (!value || value === "undefined") return "";
    return value.trim();
  }

  export function buildConsistencyPrompt({
    prompt,
    dna,
    visualSignature,
    styleMemory,
    favoritePromptStyle,
  }: BuildConsistencyPromptProps) {

    const basePrompt = safeText(prompt);

    if (!basePrompt) {
      return "";
    }

    return `
  
  ${basePrompt},
  
  CHARACTER CONSISTENCY RULES:
  
  ${safeText(dna)}
  
  VISUAL SIGNATURE:
  ${safeText(visualSignature)}
  
  STYLE MEMORY:
  ${safeText(styleMemory)}
  
  FAVORITE VISUAL STYLE:
  ${safeText(favoritePromptStyle)}
  
  Maintain:
  - same facial structure
  - same identity
  - same cinematic aesthetic
  - same photography language
  - same mood consistency
  - same fashion identity
  - same visual tone
  
  Ultra realistic cinematic photography.
  `;
  }