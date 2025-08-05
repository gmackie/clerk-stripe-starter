import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>SaaS Starter Docs</span>,
  project: {
    link: 'https://github.com/yourusername/clerk-stripe-starter',
  },
  docsRepositoryBase: 'https://github.com/yourusername/clerk-stripe-starter/tree/main/docs',
  footer: {
    text: 'SaaS Starter Documentation',
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="SaaS Starter Documentation" />
      <meta property="og:description" content="Complete documentation for the Clerk + Stripe SaaS Starter Kit" />
      <link rel="stylesheet" href="/style.css" />
    </>
  ),
  useNextSeoProps() {
    return {
      titleTemplate: '%s – SaaS Starter Docs',
    };
  },
  navigation: {
    prev: true,
    next: true,
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>;
      }
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
};

export default config;