import { BrandMapping, CategoryMapping } from "./types"

export function mapProductCategories(productResult: {error: unknown} | any[]) {
    if ('error' in productResult) {
        return productResult
    }
    const productMapping: CategoryMapping = {}
    for(const group of productResult) {
        if(!productMapping[group.category]) productMapping[group.category] = {sub_categories: {}, unit: group.category_unit}
        if(!productMapping[group.category].sub_categories[group.sub_category]) productMapping[group.category].sub_categories[group.sub_category] = {}
        productMapping[group.category].sub_categories[group.sub_category][group.store] = group.brands
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