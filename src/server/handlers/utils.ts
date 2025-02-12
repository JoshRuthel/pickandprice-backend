import { BrandMapping, CategoryMapping, MultipleProductInfo, ProductInfo } from "./types";
import { v5 as uuidv5 } from 'uuid';
const namespace = 'b6c4ff36-1d41-45b1-b4bb-6b2bc45a6f35'

export function mapProductCategories(productResult: { error: unknown } | any[]) {
  if ("error" in productResult) {
    return productResult;
  }
  const productMapping: CategoryMapping = {};
  for (const product of productResult) {
    if (!productMapping[product.category])
      productMapping[product.category] = { sub_categories: {}, unit: product.category_unit };
    if (!productMapping[product.category].sub_categories[product.sub_category])
      productMapping[product.category].sub_categories[product.sub_category] = {};
    if (!productMapping[product.category].sub_categories[product.sub_category][product.store])
      productMapping[product.category].sub_categories[product.sub_category][product.store] = {};
    productMapping[product.category].sub_categories[product.sub_category][product.store][product.brand] = true;
  }
  return productMapping;
}

export function mapStoreBrands(brandResult: { error: unknown } | any[]) {
  if ("error" in brandResult) {
    return brandResult;
  }
  const storeBrandMapping: BrandMapping = {};
  for (const brand of brandResult) {
    if (!storeBrandMapping[brand.store]) storeBrandMapping[brand.store] = [];
    storeBrandMapping[brand.store].push(brand.name);
  }
  return storeBrandMapping;
}

export function getMultipleCombinations(products: ProductInfo[], minVolume: number, maxVolume: number) {
  const multipleProducts: MultipleProductInfo[] = [];
  const min = minVolume == null ? 0 : minVolume;
  const max = maxVolume == null ? Infinity : maxVolume;
  for (const product of products) {
    let count = 1;
    while (product.category_volume * count <= max) {
      const multipleId = generateGroupId(product.id, count);
      if (max == Infinity && count > 1) {
        if (product.promotion_count > 0) {
          const multipleCount = product.promotion_count;
          const multipleId = generateGroupId(product.id, multipleCount);
          multipleProducts.push({ ...product, multipleId, multipleCount });
        }
        break;
      }
      if (min <= product.category_volume * count && product.category_volume * count <= max) {
        const multipleCount = count;
        multipleProducts.push({ ...product, multipleId, multipleCount });
      }
      count++;
    }
  }
  return multipleProducts;
}

export function getProductPrice(product: MultipleProductInfo, count: number) {
  const unitPrice =
    (product.multipleCount * count) % product.promotion_count == 0 ? product.promotion_price : product.price;
  return Number((Number(unitPrice * product.multipleCount) * count).toFixed(2));
}

export function generateGroupId(id: string, multipleCount: number) {
  const inputString = `${id}~${multipleCount}`
  const productGroupUuid = uuidv5(inputString, namespace)
  return productGroupUuid
}
