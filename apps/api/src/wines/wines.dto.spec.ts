import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListWinesQuery } from './wines.dto';

const check = async (plain: object) => {
  const dto = plainToInstance(ListWinesQuery, plain);
  return { dto, errors: await validate(dto) };
};

describe('ListWinesQuery', () => {
  it('applies defaults', async () => {
    const { dto, errors } = await check({});
    expect(errors).toHaveLength(0);
    expect(dto).toMatchObject({ page: 1, pageSize: 12 });
  });

  it('coerces numbers and treats empty strings as absent', async () => {
    const { dto, errors } = await check({ type: '', country: '', q: '', page: '2', pageSize: '' });
    expect(errors).toHaveLength(0);
    expect(dto).toMatchObject({ type: undefined, page: 2, pageSize: 12 });
  });

  it.each([
    ['unknown type', { type: 'orange' }],
    ['page 0', { page: '0' }],
    ['non-numeric page', { page: 'abc' }],
    ['fractional page', { page: '1.5' }],
    ['pageSize over 50', { pageSize: '51' }],
    ['pageSize 0', { pageSize: '0' }],
  ])('rejects %s', async (_l, plain) => {
    expect((await check(plain)).errors.length).toBeGreaterThan(0);
  });

  it('accepts pageSize 50', async () => {
    expect((await check({ pageSize: '50' })).errors).toHaveLength(0);
  });
});
