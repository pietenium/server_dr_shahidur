const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export const extractDOI = (input: string): string => {
  return input
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "");
};

export const validateDOI = (input: string): boolean => {
  const doi = extractDOI(input);
  return DOI_REGEX.test(doi);
};

export const normalizeDOI = (input: string): string => {
  const doi = extractDOI(input);

  if (!validateDOI(doi)) {
    return input;
  }

  return `https://doi.org/${doi}`;
};
