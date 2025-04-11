import { BrandMapping, CategoryMapping, DBProductInfo, MultipleProductInfo, ProductInfo } from "../../types";
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

export function getBestValueProduct(product: ProductInfo, minVolume: number| null, maxVolume: number | null) {
  const min = minVolume == null ? 0 : minVolume;
  const max = maxVolume == null ? Infinity : maxVolume;
  let multipleId: string;
  let bestValueProduct: MultipleProductInfo | null = null;
  if (max == Infinity) {
    if (product.promotionCount > 1) {
      // override the promotional count if range is infinite
      multipleId = generateGroupId(product.id, product.promotionCount);
      bestValueProduct = { ...product, multipleId, multipleCount: product.promotionCount };
    } else {
      const minCount = Math.ceil(min / (product.categoryVolume ?? 1));
      const multipleCount = minCount == 0 ? 1 : minCount;
      multipleId = generateGroupId(product.id, multipleCount);
      bestValueProduct = { ...product, multipleId, multipleCount };
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
  const {
    sale_price,
    promotion_id,
    promotion_count,
    promotion_price,
    promotion_type,
    image_url,
    sub_category,
    product_group,
    self_assigned,
    category_unit,
    category_volume,
    created_at,
    updated_at,
    is_flagged,
    is_vitality,
    ...rest // This will include all the other fields from dbProduct
  } = dbProduct;

  return {
    ...rest, // Spread the remaining fields
    salePrice: sale_price,
    promotionId: promotion_id,
    promotionCount: promotion_count,
    promotionPrice: promotion_price,
    promotionType: promotion_type,
    imageUrl: image_url,
    subCategory: sub_category,
    productGroup: product_group,
    selfAssigned: self_assigned,
    categoryUnit: category_unit,
    categoryVolume: category_volume,
    createdAt: created_at,
    updatedAt: updated_at,
    isFlagged: is_flagged,
    isVitality: is_vitality,
  };
}
