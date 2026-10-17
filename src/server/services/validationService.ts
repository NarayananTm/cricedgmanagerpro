export function validateRequiredFields(
  input: Record<string, unknown>,
  required: string[],
): string | undefined {
  const missing = required.find((field) => {
    const value = input[field];
    return value === undefined || value === null || value === "";
  });
  return missing ? `${missing} is required` : undefined;
}

