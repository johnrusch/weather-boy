import type { Preview } from '@storybook/react'
import React from 'react'
import '../src/index.css' // Import your application's styles
import { LanguageProvider } from '../src/contexts/LanguageContext'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <LanguageProvider>
        <Story />
      </LanguageProvider>
    ),
  ],
};

export default preview;
