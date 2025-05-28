import { db } from "../../database";
import { getListQuery } from "./productUtils";
import { mapProductCategories, productInfoDTO } from "../handlers/utils";

export class ProductDBProvider {
  constructor() {}

  async getProducts() {
    const productQuery =
      "SELECT * from products WHERE is_valid_volume AND is_valid_category AND price IS NOT NULL AND category NOT IN ('Sweets', 'Dessert - Cakes, Tarts & Puddings', 'Deli Meals', 'Cake Toppings & Sprinkles') AND updated_price_at > CURRENT_TIMESTAMP - INTERVAL '6 days'";
    const insertMapQuery = "UPDATE product_mapping SET data = $1 WHERE id = 1";
    try {
      const { rows: products } = await db.query(productQuery);
      const productMapping = mapProductCategories(products);
      if (!("error" in productMapping)) {
        await db.query(insertMapQuery, [productMapping] as any);
      }
      return productMapping;
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }

  async getProductMapping() {
    const productMapQuery = "SELECT data from product_mapping LIMIT 1";
    try {
      const { rows: productMapping } = await db.query(productMapQuery);
      return productMapping[0].data;
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }

  async flagProduct(id: string) {
    const flagQuery = "UPDATE products SET is_flagged = true WHERE id = $1";
    try {
      await db.query(flagQuery, [id]);
      return {};
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }

  async getProductBrands() {
    const brandQuery = `SELECT * from product_brands`;
    try {
      const { rows: brands } = await db.query(brandQuery);
      return brands;
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }

  async getProductsByName(name: string) {
    const query = `
      SELECT DISTINCT ON (barcode) *
      FROM products
      WHERE to_tsvector('english', title) @@ websearch_to_tsquery('english', $1)
      AND price is NOT NULL
      AND category NOT IN ('Sweets', 'Dessert - Cakes, Tarts & Puddings', 'Deli Meals', 'Cake Toppings & Sprinkles')
      AND updated_price_at > CURRENT_TIMESTAMP - INTERVAL '6 days'
      ORDER BY barcode, ts_rank(to_tsvector('english', title), plainto_tsquery('english', $1)) DESC
      LIMIT 10;
    `;
    try {
      const { rows: dbProducts } = await db.query(query, [name]);
      const products = dbProducts.map((product) => productInfoDTO(product));
      return { products };
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }

  async getProductsByCategory(
    barcode: string | null,
    category: string,
    subCategories: string[],
    brands: string[],
    stores: { [key: string]: boolean },
    minVolume: number,
    maxVolume: number
  ) {
    let query;
    let values: any[] = [];

    if (barcode != null) {
      query = "SELECT * from products where barcode = $1";
      values = [barcode];
    } else {
      const selectedStores = Object.keys(stores);
      values = [category];
      let index = 2;
      query = `
          SELECT *
          FROM products
          WHERE price IS NOT NULL
          AND updated_price_at > CURRENT_TIMESTAMP - INTERVAL '6 days'
          AND is_valid_category
          AND is_valid_volume
          AND category = $1
      `;
      if (subCategories.length) {
        const subCatQuery = getListQuery(index, subCategories);
        query += ` AND sub_category in ${subCatQuery}`;
        index += subCategories.length;
        values.push(...subCategories);
      }
      if (maxVolume) {
        query += ` AND category_volume <= $${index++} `;
        values.push(maxVolume);
      }
      if (brands.length) {
        const brandQuery = getListQuery(index, brands);
        query += ` AND brand IN ${brandQuery}`;
        values.push(...brands);
      }
      if (stores) {
        const storeQuery = getListQuery(index + brands.length, selectedStores);
        query += ` AND store IN ${storeQuery}`;
        values.push(...selectedStores);
      }
    }
    try {
      const { rows: dbProducts } = await db.query(query, values);
      const products = dbProducts.map((product) => productInfoDTO(product));
      return { products };
    } catch {
      return { products: [], error: "An error occurred" };
    }
  }

  async getTemplate(id: string) {
    const query = "SELECT * FROM user_templates WHERE id = $1";
    try {
      const { rows: template } = await db.query(query, [id]);
      return template[0];
    } catch {
      return { error: "An error occurred" };
    }
  }
}
