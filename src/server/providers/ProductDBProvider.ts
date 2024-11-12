import { db } from "../../database";
import { getListQuery } from "./productUtils";
import { mapProductCategories } from "../handlers/utils";

export class ProductDBProvider {
  constructor() { }

  async getProducts() {
    const productQuery = 'SELECT * from products WHERE is_valid_volume AND is_valid_category AND price IS NOT NULL'
    const insertMapQuery = 'INSERT INTO product_mapping (data) VALUES ($1)'
    try {
      const { rows: products } = await db.query(productQuery)
      const product_cat = mapProductCategories(products)
      if (!('error' in product_cat)) {
        await db.query(insertMapQuery, [product_cat])
      }
      return product_cat
    } catch (e) {
      console.error(e)
      return { error: e }
    }
  }

  async getProductMapping() {
    const productMapQuery = 'SELECT data from product_mapping LIMIT 1'
    try {
      const { rows: productMapping } = await db.query(productMapQuery)
      return productMapping[0].data
    } catch (e) {
      console.error(e)
      return { error: e }
    }
  }

  async flagProduct(id: string) {
    const flagQuery = 'UPDATE products SET is_flagged = true WHERE id = $1'
    try {
      await db.query(flagQuery, [id])
      return {}
    } catch (e) {
      console.error(e)
      return { error: e }
    }
  }

  async getProductBrands() {
    const brandQuery = `SELECT * from product_brands`
    try {
      const { rows: brands } = await db.query(brandQuery);
      return brands
    } catch (e) {
      console.error(e)
      return { error: e };
    }
  }

  async getProductsByName(name: string) {
    const query = `
      SELECT *
      FROM products
      WHERE title ILIKE $1
      AND is_valid_category
      AND is_valid_volume
      ORDER BY SIMILARITY(title, $2) DESC
      LIMIT 10;
    `;
    try {
      const { rows: products } = await db.query(query, [`%${name}%`, name]);
      return { products };
    } catch (e) {
      console.error(e)
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
    let values: any[] = []

    if (barcode != null) {
      query = 'SELECT * from products where barcode = $1'
      values = [barcode]
    } else {
      const selectedStores = Object.keys(stores).filter(key => stores[key])
      values = [category]
      let index = 2;
      query = `
          SELECT *
          FROM products
          WHERE price IS NOT NULL
          AND is_valid_category
          AND is_valid_volume
          AND category = $1
      `;
      if (subCategories.length) {
        const subCatQuery = getListQuery(index, subCategories);
        query += ` AND sub_category in ${subCatQuery}`
        index += subCategories.length
        values.push(...subCategories)
      }
      if (maxVolume) {
        query += ` AND category_volume <= $${index++} `
        values.push(maxVolume)
      }
      if (minVolume) {
        query += ` AND category_volume >= $${index++} `
        values.push(minVolume)
      }
      if (brands.length) {
        const brandQuery = getListQuery(index, brands);
        query += ` AND brand IN ${brandQuery}`
        values.push(...brands)
      }
      if (stores) {
        const storeQuery = getListQuery(index + brands.length, selectedStores);
        query += ` AND store IN ${storeQuery}`
        values.push(...selectedStores)
      }
    }

    try {
      console.log(query)
      const { rows: products } = await db.query(query, values);
      return { products };
    } catch {
      return { error: "An error occurred" };
    }
  }
}
