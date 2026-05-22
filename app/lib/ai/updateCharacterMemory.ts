type UpdateCharacterMemoryProps = {
    existingMemory?: string;
  
    newPrompt: string;
  };
  
  export function updateCharacterMemory({
    existingMemory,
    newPrompt,
  }: UpdateCharacterMemoryProps) {
  
    /*
      LIMIT SIZE
    */
  
    const trimmed =
      newPrompt.slice(0, 300);
  
    /*
      BUILD MEMORY
    */
  
    return `
  ${existingMemory || ""}
  
  ${trimmed}
  `.trim();
  }