import { BrandMapping, CategoryMapping, DBProductInfo, MultipleProductInfo, ProductInfo } from "./types";
import { v5 as uuidv5 } from "uuid";
const namespace = "b6c4ff36-1d41-45b1-b4bb-6b2bc45a6f35";

export function mapProductCategories(productResult: { error: unknown } | any[]) {
  if ("error" in productResult) {
    return productResult;
  }
  const productMapping: CategoryMapping = {};
  for (const product of productResult) {
    if (!productMapping[product.category])
      productMapping[product.category] = { subCategories: {}, unit: product.category_unit };
    if (!productMapping[product.category].subCategories[product.sub_category])
      productMapping[product.category].subCategories[product.sub_category] = {};
    if (!productMapping[product.category].subCategories[product.sub_category][product.store])
      productMapping[product.category].subCategories[product.sub_category][product.store] = {};
    productMapping[product.category].subCategories[product.sub_category][product.store][product.brand] = true;
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

export function getBestValueProduct(product: ProductInfo, minVolume: number, maxVolume: number) {
  const min = minVolume == null ? 0 : minVolume;
  const max = maxVolume == null ? Infinity : maxVolume;
  let multipleId: string;
  let bestValueProduct: MultipleProductInfo | null = null;
  if (max == Infinity) {
    if (product.promotionCount > 1) { // override the promotional count if range is infinite
      multipleId = generateGroupId(product.id, product.promotionCount);
      bestValueProduct = { ...product, multipleId, multipleCount: product.promotionCount };
    } else if (product.categoryVolume >= minVolume) { // check the product volume confines to constraint
      multipleId = generateGroupId(product.id, 1);
      bestValueProduct = { ...product, multipleId, multipleCount: 1 };
    }
  } else {
    let count = 1;
    let isPromotion = false;
    let isSet = false;
    let multipleId = generateGroupId(product.id, count);
    while (product.categoryVolume * count <= max) {
      if (product.categoryVolume * count >= min) {
        if (!isSet || (!isPromotion && count == product.promotionCount)) {
          // only override if current bestValue is not on promotion and current count is
          bestValueProduct = { ...product, multipleId, multipleCount: count };
          isSet = true;
          isPromotion = count == product.promotionCount;
        }
      }
      count++;
    }
  }
  return bestValueProduct;
}

// export function getMultipleCombinations(products: ProductInfo[], minVolume: number, maxVolume: number) {
//   const multipleProducts: MultipleProductInfo[] = [];
//   const min = minVolume == null ? 0 : minVolume;
//   const max = maxVolume == null ? Infinity : maxVolume;
//   for (const product of products) {
//     let count = 1;
//     let multipleId;
//     while (product.categoryVolume * count <= max) {
//       multipleId = generateGroupId(product.id, count);
//       if (max == Infinity) {
//         if (product.promotionCount > 1) {
//           const multipleId = generateGroupId(product.id, product.promotionCount);
//           multipleProducts.push({ ...product, multipleId, multipleCount: product.promotionCount });
//         } else {
//           multipleProducts.push({ ...product, multipleId, multipleCount: count });
//         }
//         break;
//       }
//       if (min <= product.categoryVolume * count && product.categoryVolume * count <= max) {
//         const multipleCount = count;
//         multipleProducts.push({ ...product, multipleId, multipleCount });
//       }
//       count++;
//     }
//   }
//   return multipleProducts;
// }

export function getProductPrice(product: MultipleProductInfo, count: number) {
  const unitPrice =
    (product.multipleCount * count) % product.promotionCount == 0 ? product.promotionPrice : product.price;
  return Number((Number(unitPrice * product.multipleCount) * count).toFixed(2));
}

export function generateGroupId(id: string, multipleCount: number) {
  const inputString = `${id}~${multipleCount}`;
  const productGroupUuid = uuidv5(inputString, namespace);
  return productGroupUuid;
}

export function caclulateSavings(
  productValue: number,
  averageValue: number,
  productVolume: number,
  multipleCount: number
) {
  const valueSavings = Math.abs(productValue - averageValue);
  let productSavings = valueSavings * productVolume * multipleCount;
  if (productValue > averageValue) productSavings *= -1;
  return { valueSavings, productSavings };
}

export function productInfoDTO(dbProduct: DBProductInfo): ProductInfo {
  return {
    ...dbProduct,
    salePrice: dbProduct.sale_price,
    promotionId: dbProduct.promotion_id,
    promotionCount: dbProduct.promotion_count,
    promotionPrice: dbProduct.promotion_price,
    promotionType: dbProduct.promotion_type,
    imageUrl: dbProduct.image_url,
    subCategory: dbProduct.sub_category,
    productGroup: dbProduct.product_group,
    selfAssigned: dbProduct.self_assigned,
    categoryUnit: dbProduct.category_unit,
    categoryVolume: dbProduct.category_volume,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    isFlagged: dbProduct.is_flagged,
    isVitality: dbProduct.is_vitality
  };
}
