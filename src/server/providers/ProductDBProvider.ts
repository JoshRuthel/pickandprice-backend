import { productDb } from "../../database";
import { Stores } from "../../types";
import { getListQuery } from "./productUtils";

type CategoryGroupResult = {
  category: string,
  sub_category: string,
  category_unit: string,
  brands: string[]
}

export class ProductDBProvider {
  constructor() { }

  async getProductBrands() {
    const brandQuery = `SELECT * from product_brands`
    try {
      const { rows: brands } = await productDb.query(brandQuery);
      return brands
    } catch (e) {
      console.log(e)
      return { error: e };
    }
  }

  async getProductCategories(): Promise<CategoryGroupResult[] | { error: unknown }> {
    const mappingQuery = `
      SELECT *
      FROM product_mapping_test
      ORDER BY category    
    `;
    try {
      const { rows: categories } = await productDb.query(mappingQuery);
      return categories
    } catch (e) {
      console.log(e)
      return { error: e };
    }
  }

  async getProductsByName(name: string) {
    const query = `
      SELECT *
      FROM products_test
      WHERE title ILIKE $1
      ORDER BY SIMILARITY(title, $2) DESC
      LIMIT 10;
    `;
    try {
      const { rows: products } = await productDb.query(query, [`%${name}%`, name]);
      return { products };
    } catch (e) {
      console.log(e)
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
    FROM products_test
    WHERE category = $1
    AND price IS NOT NULL
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
      const { rows: products } = await productDb.query(query, values);
      return { products };
    } catch {
      return { error: "An error occurred" };
    }
  }
}
