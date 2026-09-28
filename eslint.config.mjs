import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    // .claude-artifact-scratch/ er engangs-utkast fra Artifact-verktøyet
    // (git-ignorert allerede, se .gitignore) — skal ikke lintes som appkode.
    ignores: ['.next/**', 'node_modules/**', '.claude/**', '.claude-artifact-scratch/**'],
  },
]

export default eslintConfig
