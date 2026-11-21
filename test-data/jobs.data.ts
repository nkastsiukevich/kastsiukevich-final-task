export const jobSearchData = {
  // Scenario 1, step 4: the required search term.
  primaryTerm: "Manager",
  // Scenario 1, step 6: used only when the primary term returns 0 jobs.
  fallbackTerms: ["Designer"],
} as const;

export const jobAlertData = {
  category: "Sales & Commercial",
  location: "Älmhult",
  confirmationText: /your subscription was submitted successfully/i,
} as const;
