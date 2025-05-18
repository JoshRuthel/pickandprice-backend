import { ProductDBProvider } from "../providers/ProductDBProvider";
import { JobParams, JobType, MultipleProductInfo, ProductReturn, Template, TemplateReturn }  from "../../types";
import { caclulateSavings, getBestValueProduct, getProductPrice } from "./utils";

export async function fetchProductMapping(params: JobParams[JobType.PRODUCT_MAPPING], db: ProductDBProvider) {
  const productResult = await db.getProductMapping();
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

export async function fetchAndRankByCategory(
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
  const isMinVolumeConstraint = minVolume > 0;
  const rankingProducts = [];
  if (result.products && result.products.length) {
    let totalProductValues = 0;
    let totalProductCount = 0
    for (const dbProduct of result.products) {
      const product = getBestValueProduct(dbProduct, minVolume, maxVolume);
      if (!product) continue;
      const price = getProductPrice(product, 1);
      let value = price / (product.categoryVolume * product.multipleCount);
      if(product.categoryVolume === null) {
        value = price/(product.volume * product.multipleCount)
      }
      totalProductValues += value;
      totalProductCount++
      if (value < rankingDetails.bestValueProductAmount) {
        rankingDetails.bestValueProductId = product.multipleId;
        rankingDetails.bestValueProductAmount = value;
      }
      rankingProducts.push({ ...product, value });
    }
    rankingDetails.averageValueAmount = totalProductValues / totalProductCount;
    const sortedProducts = rankingProducts.sort((a, b) => a.value - b.value);
    const filteredProducts = sortedProducts.filter(
      (prod) =>
        prod.multipleCount === 1 || prod.multipleId === rankingDetails.bestValueProductId || !isMinVolumeConstraint
    );
    result.products = filteredProducts;
  }
  return { error: result.error, products: result.products as (MultipleProductInfo & {value: number})[], rankingDetails };
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
    const products = await fetchAndRankByCategory({ ...searchState, subCategories, brands, maxVolume, minVolume }, db);
    if (products?.products) {
      const valueProduct = products.products[0];
      const { multipleCount, multipleId, promotionPrice, price, promotionCount, categoryVolume, value } = valueProduct;
      const { averageValueAmount } = products.rankingDetails;
      const { valueSavings, productSavings } = caclulateSavings(
        value,
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
  [JobType.FLAG_PRODUCT]: flagProduct,
  [JobType.TEMPLATE_SHOP]: fetchProductsForTemplate,
};
