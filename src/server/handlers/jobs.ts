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
    const { barcode, category, subCategories, brands, stores, minVolume, maxVolume } =
        params;
    const result = await db.getProductsByCategory(
        barcode,
        category,
        subCategories,
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
    const { barcode, category, subCategories, brands, stores, minVolume, maxVolume } =
        params;
    const result = await db.getProductsByCategory(
        barcode, 
        category,
        subCategories,
        brands,
        stores,
        minVolume,
        maxVolume
    );

    const rankingDetails = {
        bestValueProductId: null,
        bestValueProductAmount: Infinity,
        averageValueAmount: 0
    }

    if (result.products && result.products.length) {
        let bestValueProduct = {}
        let totalProductValues = 0
        for (const product of result.products) {
            const value = (product.price) / (product.category_volume)
            totalProductValues += value
            if (value < rankingDetails.bestValueProductAmount) {
                rankingDetails.bestValueProductId = product.id
                rankingDetails.bestValueProductAmount = value
                bestValueProduct = product
            }
        }
        rankingDetails.averageValueAmount = totalProductValues/(result.products.length || 1)
        const sortedProducts = result.products.sort((a, b) => {
            const aValue = (a.price) / (a.category_volume)
            const bValue = (b.price) / (b.category_volume)
            return aValue - bValue
        })
        result.products = sortedProducts
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