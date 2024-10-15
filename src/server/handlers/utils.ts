import { BrandMapping, CategoryMapping } from "./types"

export function mapProductCategories(productResult: {error: unknown} | any[]) {
    if ('error' in productResult) {
        return productResult
    }
    const productMapping: CategoryMapping = {}
    for(const product of productResult) {
        if(!productMapping[product.category]) productMapping[product.category] = {sub_categories: {}, unit: product.category_unit}
        if(!productMapping[product.category].sub_categories[product.sub_category]) productMapping[product.category].sub_categories[product.sub_category] = {}
        if(!productMapping[product.category].sub_categories[product.sub_category][product.store]) productMapping[product.category].sub_categories[product.sub_category][product.store] = {}
        productMapping[product.category].sub_categories[product.sub_category][product.store][product.brand] = true
    }
    return productMapping
}

export function mapStoreBrands(brandResult: {error: unknown} | any[]) {
    if ('error' in brandResult) {
        return brandResult
    }
    const storeBrandMapping: BrandMapping = {}
    for(const brand of brandResult) {
      if(!storeBrandMapping[brand.store]) storeBrandMapping[brand.store] = []
      storeBrandMapping[brand.store].push(brand.name)
    }
    return storeBrandMapping
}