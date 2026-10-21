import { toCategory, toFood, toWine } from './mappers';

describe('mappers', () => {
  it('maps rows to API shapes', () => {
    const cat = { id: 1, slug: 's', name: 'N' };
    expect(toCategory(cat)).toEqual(cat);
    expect(toFood({ id: 2, categoryId: 1, slug: 'f', name: 'F' }, cat)).toEqual({ id: 2, slug: 'f', name: 'F', category: cat });
    const wine = toWine({ id: 1, externalId: 'e', name: 'n', winery: 'w', type: 'red', grape: null, region: null, country: null, ratingAverage: null, ratingReviews: null, imageUrl: null, createdAt: new Date(), updatedAt: new Date() });
    expect(Object.keys(wine)).toHaveLength(11);
  });
});
