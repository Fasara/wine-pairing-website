import { inferGrape, normaliseRecord, normaliseType } from './normalise';

describe('normaliseType', () => {
  it.each([
    ['reds', 'red'], ['Red', 'red'], ['whites', 'white'], ['Rosé', 'rose'], ['rose', 'rose'],
    ['champagne', 'sparkling'], [' port ', 'port'], ['dessert', 'dessert'],
  ])('maps %s to %s', (raw, expected) => expect(normaliseType(raw)).toBe(expected));

  it('returns null for unknown or non-string values', () => {
    expect(normaliseType('orange')).toBeNull();
    expect(normaliseType(5)).toBeNull();
    expect(normaliseType(undefined)).toBeNull();
  });
});

describe('inferGrape', () => {
  it('detects grape from name or region', () => {
    expect(inferGrape('Barolo Riserva 2010', null)).toBe('Nebbiolo');
    expect(inferGrape('Estate 2015', 'Rioja')).toBe('Tempranillo');
    expect(inferGrape('Napa Cabernet Sauvignon', null)).toBe('Cabernet Sauvignon');
  });
  it('returns null when nothing matches', () => {
    expect(inferGrape('Mystery Cuvee', 'Nowhere')).toBeNull();
  });
});

describe('normaliseRecord', () => {
  const raw = {
    winery: ' Maselva ',
    wine: 'Emporda 2012',
    rating: { average: '4.9', reviews: '88 ratings' },
    location: 'Spain\n·\nEmpordà',
    image: 'https://images.example.com/a.jpg',
    id: 1,
  };

  it('normalises a complete record', () => {
    expect(normaliseRecord(raw, 'red')).toEqual({
      externalId: 'red-1',
      name: 'Emporda 2012',
      winery: 'Maselva',
      type: 'red',
      grape: null,
      region: 'Empordà',
      country: 'Spain',
      ratingAverage: 4.9,
      ratingReviews: 88,
      imageUrl: 'https://images.example.com/a.jpg',
    });
  });

  it('namespaces external ids by type so ids from different endpoints do not collide', () => {
    expect(normaliseRecord(raw, 'white')?.externalId).toBe('white-1');
  });

  it('tolerates missing optional fields', () => {
    const wine = normaliseRecord({ winery: 'W', wine: 'N', id: '7' }, 'port');
    expect(wine).toMatchObject({ externalId: 'port-7', country: null, region: null, ratingAverage: null, ratingReviews: null, imageUrl: null });
  });

  it('keeps a country with no region and joins multiple region parts', () => {
    expect(normaliseRecord({ ...raw, location: 'France' }, 'red')).toMatchObject({ country: 'France', region: null });
    expect(normaliseRecord({ ...raw, location: 'France\n·\nBurgundy\n·\nChablis' }, 'white')).toMatchObject({ region: 'Burgundy, Chablis' });
  });

  it('drops invalid ratings and image urls', () => {
    const wine = normaliseRecord({ ...raw, rating: { average: 'n/a', reviews: 'none' }, image: 'javascript:alert(1)' }, 'red');
    expect(wine).toMatchObject({ ratingAverage: null, ratingReviews: null, imageUrl: null });
    expect(normaliseRecord({ ...raw, rating: { average: '9.5' }, image: 'not a url' }, 'red')).toMatchObject({ ratingAverage: null, imageUrl: null });
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['no id', { winery: 'W', wine: 'N' }],
    ['no name', { winery: 'W', id: 1 }],
    ['blank winery', { winery: '  ', wine: 'N', id: 1 }],
    ['object id', { winery: 'W', wine: 'N', id: {} }],
  ])('rejects bad record: %s', (_label, record) => {
    expect(normaliseRecord(record, 'red')).toBeNull();
  });
});
