export const removeFolders = [
  "node_modules",
  ".git",
  ".github",
  ".vscode",
  ".idea",
  "dist",
  "build",
  "out",
  "coverage",
  "tmp",
  "temp",
  "log",
  "logs",
];

export const lockFiles = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"];

export const removeFoldersCommand = (dir: string): string => {
  return `find ${dir} -type d \\( ${removeFolders
    .map((folder) => `-name '${folder}'`)
    .join(" -o ")} \\) -exec rm -rf {} +`;
};

export const removeFilesCommand = (dir: string): string => {
  return `find ${dir} -type f \\( ${lockFiles
    .map((file) => `-name '${file}'`)
    .join(" -o ")} \\) -delete`;
};
