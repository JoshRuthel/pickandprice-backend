import { ProductDBProvider } from "../providers/ProductDBProvider";
import { JobParams, JobType } from "./types";


export async function fetchProductMapping(params: JobParams[JobType.PRODUCT_MAPPING], db: ProductDBProvider) {
    const productResult = await db.getProductMapping()
    return productResult
}

export async function fetchByName(params: JobParams[JobType.NAME_SEARCH], db: ProductDBProvider) {
    const { name } = params;
    const result = await db.getProductsByName(name);
    return result;
}

export async function fetchByCategory(params: JobParams[JobType.CATEGORY_SEARCH], db: ProductDBProvider) {
    const { id, category, subCategory, brands, stores, minVolume, maxVolume } =
        params;
    const result = await db.getProductsByCategory(
        id,
        category,
        subCategory,
        brands,
        stores,
        minVolume,
        maxVolume
    );
    return result;
}

export async function flagProduct(params: JobParams[JobType.FLAG_PRODUCT], db: ProductDBProvider) {
    const {id} = params
    const result = await db.flagProduct(id)
    return result
}

export async function fetchAndRankByCategory(params: JobParams[JobType.CATEGORY_SEARCH], db: ProductDBProvider) {
    const { id, category, subCategory, brands, stores, minVolume, maxVolume } =
        params;
    const result = await db.getProductsByCategory(
        id, 
        category,
        subCategory,
        brands,
        stores,
        minVolume,
        maxVolume
    );

    const rankingDetails = {
        bestValueProductId: null,
        bestValueProductAmount: Infinity,
        bestPriceProductId: null,
        bestPriceProductAmount: Infinity
    }

    if (result.products && result.products.length) {
        let bestValueProduct = {}
        for (const product of result.products) {
            const value = (product.price) / (product.category_unit_volume)
            if (value < rankingDetails.bestValueProductAmount) {
                rankingDetails.bestValueProductId = product.id
                rankingDetails.bestValueProductAmount = value
                bestValueProduct = product
            }
        }
        const sortedProducts = result.products.sort((a, b) => a.price - b.price)
        rankingDetails.bestPriceProductId = result.products[0]?.id
        rankingDetails.bestPriceProductAmount = result.products[0]?.price
        const rankedProducts = [sortedProducts[0]]
        if(rankingDetails.bestPriceProductId != rankingDetails.bestValueProductId) {
            rankedProducts.push(bestValueProduct)
        }
        rankedProducts.push(...sortedProducts.filter((prod, i) => prod.id != rankingDetails.bestValueProductId && i != 0))
        result.products = rankedProducts
    }
    return {...result, rankingDetails};
}

export const JobMapper: any = {
    [JobType.PRODUCT_MAPPING]: fetchProductMapping,
    [JobType.NAME_SEARCH]: fetchByName,
    [JobType.CATEGORY_SEARCH]: fetchByCategory,
    [JobType.CATEGORY_RANK]: fetchAndRankByCategory,
    [JobType.FLAG_PRODUCT]: flagProduct
}