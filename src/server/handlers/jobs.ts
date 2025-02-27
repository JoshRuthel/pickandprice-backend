import { ProductDBProvider } from "../providers/ProductDBProvider";
import {
  CartProductInfo,
  JobParams,
  JobType,
  MultipleProductInfo,
  ProductInfo,
  ProductReturn,
  SearchState,
  Template,
  TemplateReturn,
} from "./types";
import { caclulateSavings, getMultipleCombinations, getProductPrice } from "./utils";

export async function fetchProductMapping(params: JobParams[JobType.PRODUCT_MAPPING], db: ProductDBProvider) {
  const productResult = await db.getProducts();
  return productResult;
}

export async function fetchByName(params: JobParams[JobType.NAME_SEARCH], db: ProductDBProvider) {
  const { name } = params;
  const result = await db.getProductsByName(name);
  return result;
}

export async function fetchByCategory(params: JobParams[JobType.CATEGORY_SEARCH], db: ProductDBProvider) {
  const { barcode, category, subCategories, brands, stores, minVolume, maxVolume } = params;
  const result = await db.getProductsByCategory(barcode, category, subCategories, brands, stores, minVolume, maxVolume);
  return result;
}

export async function flagProduct(params: JobParams[JobType.FLAG_PRODUCT], db: ProductDBProvider) {
  const { id } = params;
  const result = await db.flagProduct(id);
  return result;
}

export async function fetchAndRankByCategory(params: JobParams[JobType.CATEGORY_SEARCH], db: ProductDBProvider) {
  const { barcode, category, subCategories, brands, stores, minVolume, maxVolume } = params;
  const result = await db.getProductsByCategory(barcode, category, subCategories, brands, stores, minVolume, maxVolume);

  const rankingDetails = {
    bestValueProductId: "",
    bestValueProductAmount: Infinity,
    averageValueAmount: 0,
  };

  if (result.products && result.products.length) {
    let bestValueProduct = {};
    let totalProductValues = 0;
    for (const product of result.products) {
      const value = product.price / product.categoryVolume;
      totalProductValues += value;
      if (value < rankingDetails.bestValueProductAmount) {
        rankingDetails.bestValueProductId = product.id;
        rankingDetails.bestValueProductAmount = value;
        bestValueProduct = product;
      }
    }
    rankingDetails.averageValueAmount = totalProductValues / (result.products.length || 1);
    const sortedProducts = result.products.sort((a, b) => {
      const aValue = a.price / a.categoryVolume;
      const bValue = b.price / b.categoryVolume;
      return aValue - bValue;
    });
    result.products = sortedProducts;
  }
  return { ...result, rankingDetails };
}

export async function fetchAndRankByCategoryMultiple(
  params: JobParams[JobType.CATEGORY_SEARCH],
  db: ProductDBProvider
): Promise<ProductReturn> {
  const { barcode, category, subCategories, brands, stores, minVolume, maxVolume } = params;
  const result = await db.getProductsByCategory(barcode, category, subCategories, brands, stores, minVolume, maxVolume);
  const rankingDetails = {
    bestValueProductId: "",
    bestValueProductAmount: Infinity,
    averageValueAmount: 0,
  };

  const rankingProducts = [];
  if (result.products && result.products.length) {
    const multipleProducts = getMultipleCombinations(result.products, minVolume, maxVolume);
    let bestValueProduct = {};
    let totalProductValues = 0;
    for (const product of multipleProducts) {
      const price = getProductPrice(product, 1);
      const value = price / (product.categoryVolume * product.multipleCount);
      totalProductValues += value;
      if (value < rankingDetails.bestValueProductAmount) {
        rankingDetails.bestValueProductId = product.multipleId;
        rankingDetails.bestValueProductAmount = value;
        bestValueProduct = product;
      }
      rankingProducts.push({ ...product, value });
    }
    rankingDetails.averageValueAmount = totalProductValues / (multipleProducts.length || 1);
    const sortedProducts = rankingProducts.sort((a, b) => a.value - b.value);
    const filteredProducts: MultipleProductInfo[] = sortedProducts.filter(
      (prod) =>
        prod.multipleId == rankingDetails.bestValueProductId ||
        prod.multipleCount < 2 ||
        prod.multipleCount == prod.promotionCount
    );
    result.products = filteredProducts;
  }
  return { error: result.error, products: result.products as MultipleProductInfo[], rankingDetails };
}

export async function fetchProductsForTemplate(params: JobParams[JobType.TEMPLATE_SHOP], db: ProductDBProvider) {
  const { templateId } = params;
  const template: Template = await db.getTemplate(templateId);
  const { config } = template;
  const res: TemplateReturn = {};
  for (const productId in config) {
    const searchState = config[productId];
    const subCategories = Object.keys(searchState.subCategories);
    const brands = Object.keys(searchState.brands);
    const minVolume = searchState.minVolume ?? 0;
    const maxVolume = searchState.maxVolume ?? Infinity;
    const products = await fetchAndRankByCategoryMultiple(
      { ...searchState, subCategories, brands, maxVolume, minVolume },
      db
    );
    if (products?.products) {
      const valueProduct = products.products[0];
      const { multipleCount, multipleId, promotionPrice, price, promotionCount, categoryVolume } = valueProduct;
      const unitPrice = multipleCount == promotionCount ? promotionPrice : price;
      const { averageValueAmount } = products.rankingDetails;
      const { valueSavings, productSavings } = caclulateSavings(
        unitPrice / categoryVolume,
        averageValueAmount,
        categoryVolume,
        multipleCount
      );
      res[multipleId] = {
        cartItem: { ...valueProduct, valueSavings, productSavings, isValueChoice: true, count: 1 },
        searchState,
      };
    }
  }
  return res;
}

export const JobMapper: any = {
  [JobType.PRODUCT_MAPPING]: fetchProductMapping,
  [JobType.NAME_SEARCH]: fetchByName,
  [JobType.CATEGORY_SEARCH]: fetchByCategory,
  [JobType.CATEGORY_RANK]: fetchAndRankByCategory,
  [JobType.CATEGORY_RANK_MULTIPLE]: fetchAndRankByCategoryMultiple,
  [JobType.FLAG_PRODUCT]: flagProduct,
  [JobType.TEMPLATE_SHOP]: fetchProductsForTemplate,
};
