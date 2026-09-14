import crypto from "crypto";

export const normalizeContent = (content = "") => content.trim();

export const countWordsFromHtml = (html = "") => {
  if (!html) return 0;
  const stripped = html.replace(/<[^>]*>/g, " ").trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
};

export const buildDefaultCommitMessage = ({
  action = "save",
  versionNumber,
  restoredFromVersionNumber,
}) => {
  if (action === "initial") {
    return `Initialize document history (v${versionNumber})`;
  }

  if (action === "restore") {
    return `Restore from v${restoredFromVersionNumber} into v${versionNumber}`;
  }

  return `Save changes as v${versionNumber}`;
};
