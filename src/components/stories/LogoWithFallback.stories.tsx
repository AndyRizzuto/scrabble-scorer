import React from 'react';
import LogoWithFallback from '../header/LogoWithFallback';

export default {
  title: 'Header/LogoWithFallback',
  component: LogoWithFallback,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    src: '/logo.svg',
    alt: 'Scrabble Logo',
    fallback: '/favicon.svg',
    className: 'w-16 h-16',
  },
};

export const BrokenImage = {
  args: {
    src: '/broken-link.svg',
    alt: 'Broken Logo',
    fallback: '/favicon.svg',
    className: 'w-16 h-16',
  },
};
