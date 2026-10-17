import { and, asc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  categories,
  presentations,
  productImages,
  products,
  quantityDiscounts,
  type NewProduct,
  type Presentation,
  type Product,
  type ProductImage,
} from '../../db/schema/index.js';

export interface ListFilters {
  onlyActive: boolean;
  categorySlug?: string;
  subcategory?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
  presentations: Presentation[];
}

export interface ListResult {
  rows: ProductWithImages[];
  total: number;
}

export async function findAll(filters: ListFilters): Promise<ListResult> {
  const conditions = [];

  if (filters.onlyActive) {
    conditions.push(eq(products.isActive, true));
  }

  if (filters.subcategory) {
    conditions.push(eq(products.subcategory, filters.subcategory));
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(like(products.name, pattern), like(products.description, pattern)),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let whereWithCategory = where;
  if (filters.categorySlug) {
    const categoryRow = await db.query.categories.findFirst({
      where: eq(categories.slug, filters.categorySlug),
      columns: { id: true },
    });
    if (!categoryRow) {
      return { rows: [], total: 0 };
    }
    const catCond = eq(products.categoryId, categoryRow.id);
    whereWithCategory = where ? and(where, catCond) : catCond;
  }

  const offset = (filters.page - 1) * filters.limit;

  const rows = await db.query.products.findMany({
    where: whereWithCategory,
    orderBy: [asc(products.name)],
    limit: filters.limit,
    offset,
    with: {
      images: {
        limit: 1,
        orderBy: [asc(productImages.sortOrder), asc(productImages.id)],
      },
      presentations: {
        where: eq(presentations.isActive, true),
        orderBy: sql`
          CASE ${presentations.type}
            WHEN 'unidad' THEN 1
            WHEN 'paquete' THEN 2
            WHEN 'bulto' THEN 3
            WHEN 'caja' THEN 4
            ELSE 5
          END
        `,
      },
    },
  });

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(whereWithCategory);

  const total = Number(countRow?.count ?? 0);
  return { rows, total };
}

export async function findById(id: number): Promise<Product | undefined> {
  return db.query.products.findFirst({
    where: eq(products.id, id),
  });
}

export async function findBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      images: {
        orderBy: [asc(productImages.sortOrder), asc(productImages.id)],
      },
      presentations: {
        orderBy: sql`
          CASE ${presentations.type}
            WHEN 'unidad' THEN 1
            WHEN 'paquete' THEN 2
            WHEN 'bulto' THEN 3
            WHEN 'caja' THEN 4
            ELSE 5
          END
        `,
        with: {
          quantityDiscounts: {
            where: eq(quantityDiscounts.isActive, true),
            orderBy: [asc(quantityDiscounts.minQuantity)],
          },
        },
      },
      category: true,
    },
  });
}

export async function findSlugConflict(
  slug: string,
  excludeId?: number,
): Promise<Product | undefined> {
  const found = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    columns: { id: true },
  });
  if (!found) return undefined;
  if (excludeId !== undefined && found.id === excludeId) return undefined;
  return found as unknown as Product;
}

export async function categoryExists(categoryId: number): Promise<boolean> {
  const row = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
    columns: { id: true },
  });
  return Boolean(row);
}

export async function findDistinctSubcategories(
  categorySlug: string,
): Promise<string[]> {
  const rows = await db
    .selectDistinct({ subcategory: products.subcategory })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(categories.slug, categorySlug),
        eq(products.isActive, true),
        sql`${products.subcategory} IS NOT NULL`,
        sql`${products.subcategory} != ''`,
      ),
    )
    .orderBy(asc(products.subcategory));

  return rows
    .map((r) => r.subcategory)
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
}

export async function create(data: NewProduct): Promise<Product> {
  const [row] = await db.insert(products).values(data).returning();
  return row!;
}

export async function update(
  id: number,
  data: Partial<NewProduct>,
): Promise<Product | undefined> {
  const [row] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning();
  return row;
}

export async function remove(id: number): Promise<boolean> {
  const rows = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return rows.length > 0;
}

export async function countPresentations(productId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(presentations)
    .where(eq(presentations.productId, productId));
  return Number(row?.count ?? 0);
}

export async function findByIdWithRelations(id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: {
        orderBy: [asc(productImages.sortOrder), asc(productImages.id)],
      },
      presentations: {
        orderBy: sql`
          CASE ${presentations.type}
            WHEN 'unidad' THEN 1
            WHEN 'paquete' THEN 2
            WHEN 'bulto' THEN 3
            WHEN 'caja' THEN 4
            ELSE 5
          END
        `,
        with: {
          quantityDiscounts: {
            orderBy: [asc(quantityDiscounts.minQuantity)],
          },
        },
      },
      category: true,
    },
  });
}