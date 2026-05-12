import { describe, it, expect } from 'vitest';

describe('Frontend Basic Test', () => {
  it('should verify that truth is true', () => {
    expect(true).toBe(true);
  });

  it('should verify that the app environment is defined', () => {
    expect(import.meta.env.MODE).toBeDefined();
  });
});
