import { BrandMapping, CategoryMapping, MultipleProductInfo, ProductInfo } from "./types"
import { v4 as uuid } from 'uuid';

export function mapProductCategories(productResult: { error: unknown } | any[]) {
    if ('error' in productResult) {
        return productResult
    }
    const productMapping: CategoryMapping = {}
    for (const product of productResult) {
        if (!productMapping[product.category]) productMapping[product.category] = { sub_categories: {}, unit: product.category_unit }
        if (!productMapping[product.category].sub_categories[product.sub_category]) productMapping[product.category].sub_categories[product.sub_category] = {}
        if (!productMapping[product.category].sub_categories[product.sub_category][product.store]) productMapping[product.category].sub_categories[product.sub_category][product.store] = {}
        productMapping[product.category].sub_categories[product.sub_category][product.store][product.brand] = true
    }
    return productMapping
}

export function mapStoreBrands(brandResult: { error: unknown } | any[]) {
    if ('error' in brandResult) {
        return brandResult
    }
    const storeBrandMapping: BrandMapping = {}
    for (const brand of brandResult) {
        if (!storeBrandMapping[brand.store]) storeBrandMapping[brand.store] = []
        storeBrandMapping[brand.store].push(brand.name)
    }
    return storeBrandMapping
}

export function getMultipleCombinations(products: ProductInfo[], minVolume: number, maxVolume: number) {
    const multipleProducts: MultipleProductInfo[] = []
    const min = minVolume == null ? 0 : minVolume
    const max = maxVolume == null ? Infinity : maxVolume
    for (const product of products) {
        let count = 1
        while (product.category_volume * count <= max) {
            if (max == Infinity && count > 1) break
            if (min <= product.category_volume * count && product.category_volume * count <= max) {
                const multipleId = uuid()
                const multipleCount = count
                multipleProducts.push({ ...product, multipleId, multipleCount })
            }
            count++
        }
    }
    return multipleProducts
}

export function getProductPrice(product: MultipleProductInfo, count: number) {
    const unitPrice = (product.multipleCount*count)%product.promotion_count == 0 ? product.promotion_price : product.price
    return Number((Number(unitPrice * product.multipleCount) *count).toFixed(2))
  }