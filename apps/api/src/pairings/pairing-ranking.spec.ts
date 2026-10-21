import { Food, Wine } from '../common/mappers';
import { Candidate, rankFoodPairings, rankWinePairings } from './pairing-ranking';

const food = (id: number, name: string): Food => ({ id, slug: name, name, category: { id: 1, slug: 'c', name: 'C' } });
const wine = (id: number, ratingAverage: number | null): Wine => ({
  id, externalId: `e${id}`, name: `w${id}`, winery: 'x', type: 'red', grape: null, region: null,
  country: null, ratingAverage, ratingReviews: null, imageUrl: null,
});
const cand = <T>(item: T, strength: number, specific = false, reason = 'r'): Candidate<T> => ({ item, strength, reason, specific });

describe('rankWinePairings', () => {
  it('sorts by strength desc then name', () => {
    const out = rankWinePairings([cand(food(1, 'Zucchini'), 3), cand(food(2, 'Apple'), 3), cand(food(3, 'Steak'), 5)]);
    expect(out.map((p) => p.food.name)).toEqual(['Steak', 'Apple', 'Zucchini']);
  });

  it('keeps the strongest rule per food', () => {
    const out = rankWinePairings([cand(food(1, 'A'), 3, false, 'generic'), cand(food(1, 'A'), 5, true, 'specific')]);
    expect(out).toEqual([{ food: food(1, 'A'), strength: 5, reason: 'specific' }]);
  });

  it('prefers the grape-specific rule on equal strength', () => {
    const out = rankWinePairings([cand(food(1, 'A'), 4, false, 'generic'), cand(food(1, 'A'), 4, true, 'specific'), cand(food(1, 'A'), 4, false, 'other')]);
    expect(out).toHaveLength(1);
    expect(out[0].reason).toBe('specific');
  });

  it('returns an empty list for no candidates', () => {
    expect(rankWinePairings([])).toEqual([]);
  });
});

describe('rankFoodPairings', () => {
  it('sorts by strength, then rating desc with unrated last, then id', () => {
    const out = rankFoodPairings(
      [cand(wine(1, null), 5), cand(wine(2, 4.1), 5), cand(wine(3, 4.8), 5), cand(wine(4, 3.0), 2), cand(wine(5, 4.1), 5)],
      10,
    );
    expect(out.map((p) => p.wine.id)).toEqual([3, 2, 5, 1, 4]);
  });

  it('dedupes wines keeping the best strength', () => {
    const out = rankFoodPairings([cand(wine(1, 4), 2), cand(wine(1, 4), 4)], 10);
    expect(out).toHaveLength(1);
    expect(out[0].strength).toBe(4);
  });

  it('applies the limit', () => {
    const out = rankFoodPairings([cand(wine(1, 5), 3), cand(wine(2, 4), 3), cand(wine(3, 3), 3)], 2);
    expect(out.map((p) => p.wine.id)).toEqual([1, 2]);
  });
});
