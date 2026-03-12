// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from './src/App';
import React from 'react';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { }, // deprecated
        removeListener: () => { }, // deprecated
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

describe('App', () => {
    it('should render without crashing', () => {
        try {
            render(<App />);
        } catch (e) {
            console.error('CRASH CAUSE:', e);
            throw e;
        }
    });
});
