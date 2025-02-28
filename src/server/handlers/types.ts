type NameParams = { name: string };

type FlagParams = { id: string };

type TemplateParams = { templateId: string };

export type DBProductInfo = {
  id: string;
  title: string;
  price: number;
  sale_price: number;
  barcode: string;
  brand: string;
  store: string;
  volume: number;
  unit: string;
  promotion_id: string | null;
  promotion_count: number;
  promotion_price: number;
  promotion_type: string;
  image_url: string;
  category: string;
  sub_category: string;
  product_group: string;
  self_assigned: boolean;
  category_unit: string;
  category_volume: number;
  created_at: Date;
  updated_at: Date;
  is_flagged: boolean;
};

export type ProductInfo = {
  id: string;
  title: string;
  price: number;
  salePrice: number;
  barcode: string;
  brand: string;
  store: string;
  volume: number;
  unit: string;
  promotionId: string | null;
  promotionCount: number;
  promotionPrice: number;
  promotionType: string;
  imageUrl: string;
  category: string;
  subCategory: string;
  productGroup: string;
  selfAssigned: boolean;
  categoryUnit: string;
  categoryVolume: number;
  createdAt: Date;
  updatedAt: Date;
  isFlagged: boolean;
};

export type MultipleProductInfo = ProductInfo & { multipleId: string; multipleCount: number };

export type CartProductInfo = MultipleProductInfo & {
  count: number;
  productSavings: number;
  valueSavings: number;
  isValueChoice: boolean;
};

type CategoryParams = {
  barcode: string | null;
  category: string;
  subCategories: string[];
  brands: string[];
  stores: { [key: string]: boolean };
  minVolume: number;
  maxVolume: number;
};

export enum JobType {
  PRODUCT_MAPPING = "product-mapping",
  NAME_SEARCH = "name-search",
  CATEGORY_SEARCH = "category-search",
  CATEGORY_RANK = "category_rank",
  FLAG_PRODUCT = "flag_product",
  TEMPLATE_SHOP = "template_shopt",
}

export type JobTypes =
  | JobType.NAME_SEARCH
  | JobType.CATEGORY_SEARCH
  | JobType.PRODUCT_MAPPING
  | JobType.CATEGORY_RANK
  | JobType.FLAG_PRODUCT
  | JobType.TEMPLATE_SHOP;

export type JobParams = {
  [JobType.PRODUCT_MAPPING]: any;
  [JobType.NAME_SEARCH]: NameParams;
  [JobType.CATEGORY_SEARCH]: CategoryParams;
  [JobType.CATEGORY_RANK]: CategoryParams;
  [JobType.FLAG_PRODUCT]: FlagParams;
  [JobType.TEMPLATE_SHOP]: TemplateParams;
};

export type JobRequest<T extends JobType> = Request & {
  body: {
    jobType: T;
    params: JobParams[T];
  };
};

export type CategoryMapping = {
  [key: string]: { subCategories: { [key: string]: { [key: string]: { [key: string]: true } } }; unit: string };
};
export type BrandMapping = { [key: string]: string[] };

type StoreState = {
  [key: string]: true;
};

export type SearchState = {
  barcode: string | null;
  category: string;
  subCategories: { [key: string]: true };
  minVolume: number | null;
  maxVolume: number | null;
  brands: { [key: string]: true };
  stores: StoreState;
};

export type SelectionState = { [key: string]: SearchState };

export type Template = {
  id: string;
  name: string;
  config: SelectionState;
  createdAt: string;
};

export type TemplateReturn = {
  [key: string]: {
    cartItem: CartProductInfo;
    searchState: SearchState;
  };
};

export type ProductReturn = {
  products: MultipleProductInfo[];
  error?: string;
  rankingDetails: { bestValueProductId: string; bestValueProductAmount: number; averageValueAmount: number };
};
