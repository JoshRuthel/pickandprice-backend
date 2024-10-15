import { Pool } from "pg";
import { db } from "../../database";
import { getListQuery } from "./productUtils";
import { mapProductCategories } from "../handlers/utils";

type CategoryGroupResult = {
  category: string,
  sub_category: string,
  category_unit: string,
  brands: string[]
}

export class ProductDBProvider {
  constructor() {}

  async getProducts() {
    const productQuery = 'SELECT * from products WHERE is_valid_volume AND is_valid_category AND price IS NOT NULL'
    const insertMapQuery = 'INSERT INTO product_mapping (data) VALUES ($1)'
    try {
      const {rows: products} = await db.query(productQuery)
      const product_cat = mapProductCategories(products)
      if(!('error' in product_cat)) {
        await db.query(insertMapQuery, [product_cat])
      }
      return product_cat
    } catch (e) {
      console.error(e)
      return {error: e}
    }
  }

  async getProductMapping() {
    const productMapQuery = 'SELECT data from product_mapping LIMIT 1'
    try {
      const {rows: productMapping} = await db.query(productMapQuery)
      return productMapping[0].data
    } catch (e) {
      console.error(e)
      return {error: e}
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
    category: string,
    subCategory: string,
    brands: string[],
    stores: { [key: string]: boolean },
    minVolume: number,
    maxVolume: number
  ) {
    const selectedStores = Object.keys(stores).filter(key => stores[key])
    const values: any[] = [category]
    let index = 2;
    let query = `
    SELECT *
    FROM products
    WHERE category = $1
    AND price IS NOT NULL
    AND is_valid_category
    AND is_valid_volume
  `;
    if(subCategory) {
      query += ` AND sub_category = $${index++}`
      values.push(subCategory)
    }
    if(maxVolume) {
      query += ` AND category_unit_volume <= $${index++} `
      values.push(maxVolume)
    }
    if(minVolume) {
      query += ` AND category_unit_volume >= $${index++} `
      values.push(minVolume)
    }
    if (brands.length) {
      const brandQuery = getListQuery(index, brands);
      query += ` AND brand IN ${brandQuery}`
      values.push(...brands)
    }
    if(stores) {
      const storeQuery = getListQuery(index + brands.length, selectedStores);
      query += ` AND store IN ${storeQuery}`
      values.push(...selectedStores)
    }
    try {
      const { rows: products } = await db.query(query, values);
      return { products };
    } catch {
      return { error: "An error occurred" };
    }
  }
}
