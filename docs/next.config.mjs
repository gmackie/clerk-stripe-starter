import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra({
  // Next.js config
  reactStrictMode: true,
  output: 'standalone',
});