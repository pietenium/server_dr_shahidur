const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export const validateDOI = (doi: string): boolean => {
  return DOI_REGEX.test(doi);
};

export const normalizeDOI = (doi: string): string => {
  if (doi.startsWith("https://doi.org/")) {
    return doi;
  }
  if (doi.match(DOI_REGEX)) {
    return `https://doi.org/${doi}`;
  }
  return doi;
};
