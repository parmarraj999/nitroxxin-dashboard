import { currency, formatDate } from './utils/formatters';

test('formats event dates for display', () => {
  expect(formatDate('2026-10-28')).toMatch(/2026/);
});

test('formats dashboard currency in INR', () => {
  expect(currency(2500)).toContain('2,500');
});
