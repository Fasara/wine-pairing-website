import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, ilike, or, sql, SQL } from 'drizzle-orm';
import { Paginated, toWine, Wine } from '../common/mappers';
import { Database, DRIZZLE } from '../database/database.module';
import { wines } from '../database/schema';
import { ListWinesQuery } from './wines.dto';

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

@Injectable()
export class WinesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(query: ListWinesQuery): Promise<Paginated<Wine>> {
    const { type, country, q, page, pageSize } = query;
    const conditions: (SQL | undefined)[] = [];
    if (type) conditions.push(eq(wines.type, type));
    if (country) conditions.push(sql`lower(${wines.country}) = lower(${country})`);
    if (q) {
      const pattern = `%${escapeLike(q)}%`;
      conditions.push(or(ilike(wines.name, pattern), ilike(wines.winery, pattern), ilike(wines.grape, pattern)));
    }
    const where = and(...conditions);

    const [rows, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(wines)
        .where(where)
        .orderBy(sql`${wines.ratingAverage} desc nulls last`, desc(wines.ratingReviews), asc(wines.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      this.db.select({ count: sql<number>`count(*)::int` }).from(wines).where(where),
    ]);
    return { items: rows.map(toWine), total: count, page, pageSize };
  }

  async countries(): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ country: wines.country })
      .from(wines)
      .where(sql`${wines.country} is not null`)
      .orderBy(asc(wines.country));
    return rows.map((r) => r.country as string);
  }

  async findOne(id: number): Promise<Wine> {
    const [row] = await this.db.select().from(wines).where(eq(wines.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Wine ${id} not found`);
    return toWine(row);
  }
}
