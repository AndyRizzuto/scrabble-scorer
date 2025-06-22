import React from 'react';
import HeaderNav from '../header/HeaderNav';

export default {
  title: 'Header/HeaderNav',
  component: HeaderNav,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    currentPage: 'game',
    hasCurrentGame: true,
    onPageChange: (page: string) => alert('Page: ' + page),
    onShowSetup: () => alert('Show Setup'),
  },
};
