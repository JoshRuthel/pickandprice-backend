type NameParams = { name: string };

type FlagParams = {id: string}

export type ProductInfo = {
  id: string,
  title: string,
  price: number,
  sale_price: number,
  barcode: string,
  brand: string,
  store: string,
  volume: number,
  unit: string,
  promotion_id: string | null,
  image_url: string,
  category: string,
  sub_category: string,
  product_group: string,
  self_assigned: boolean,
  category_unit: string,
  category_volume: number,
  created_at: Date,
  updated_at: Date,
  is_flagged: boolean
};

export type MultipleProductInfo = ProductInfo & {multipleId: string, multipleCount: number}

type CategoryParams = {
  barcode: string | null;
  category: string;
  subCategories: string[];
  brands: string[];
  stores: {[key:string]: boolean};
  minVolume: number;
  maxVolume: number;
};

export enum JobType {
  PRODUCT_MAPPING = "product-mapping",
  NAME_SEARCH = "name-search",
  CATEGORY_SEARCH = "category-search",
  CATEGORY_RANK = "category_rank",
  CATEGORY_RANK_MULTIPLE = 'category_rank_multiple',
  FLAG_PRODUCT = 'flag_product'
}

export type JobTypes = JobType.NAME_SEARCH | JobType.CATEGORY_SEARCH | JobType.PRODUCT_MAPPING | JobType.CATEGORY_RANK | JobType.FLAG_PRODUCT;

export type JobParams = {
  [JobType.PRODUCT_MAPPING]: any
  [JobType.NAME_SEARCH]: NameParams;
  [JobType.CATEGORY_SEARCH]: CategoryParams;
  [JobType.CATEGORY_RANK]: CategoryParams;
  [JobType.CATEGORY_RANK_MULTIPLE]: CategoryParams,
  [JobType.FLAG_PRODUCT]: FlagParams
};

export type JobRequest<T extends JobType> = Request & {
  body: {
    jobType: T;
    params: JobParams[T];
  };
};

export type CategoryMapping = {[key:string]: {sub_categories: {[key: string]: {[key: string]: {[key: string]: true}}}, unit: string}}
export type BrandMapping = {[key: string]: string[]}
