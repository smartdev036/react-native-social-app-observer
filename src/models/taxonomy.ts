export interface Taxonomy {
  term_id: number;
  name: string;
  permalink: string;
  slug: string;
  type: string;
  style?: TaxonomyStyle;
}

export interface TaxonomyStyle {
  backgroundColor?: string;
  foregroundColor?: string;
  iconUri?: string;
}
