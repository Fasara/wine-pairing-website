import { describe, expect, it } from 'vitest';
import { formatRating, parsePage, parseType, typeLabel, winesHref } from '@/lib/format';

describe('format helpers', () => {
  it('labels types', () => {
    expect(typeLabel('rose')).toBe('Rosé');
  });
  it('parses type safely', () => {
    expect(parseType('white')).toBe('white');
    expect(parseType('beer')).toBeUndefined();
    expect(parseType(undefined)).toBeUndefined();
  });
  it('parses page safely', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });
  it('formats ratings', () => {
    expect(formatRating(null, 5)).toBeNull();
    expect(formatRating(4.25, null)).toBe('4.3');
    expect(formatRating(4.4, 1234)).toBe('4.4 (1,234 reviews)');
  });
  it('builds wine hrefs', () => {
    expect(winesHref({})).toBe('/wines');
    expect(winesHref({ page: 1 })).toBe('/wines');
    expect(winesHref({ type: 'red', country: 'Italy', q: 'x', page: 2 })).toBe('/wines?type=red&country=Italy&q=x&page=2');
  });
});
