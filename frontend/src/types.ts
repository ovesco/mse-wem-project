export type Store = {
  id: number;
  storeid: string;
  storename: string;
  nb_saved_articles: number;
  number_of_ratings: number;
  number_of_saved_reviews: number;
  product_global_review_avg: number;
  stars_avg: number;
  computed_stars_avg: number;
};

export type StarsDistribution = {
  stars: Array<{count: number, stars: number}>,
  computed_stars: Array<{count: number, stars: number}>
}

export type LeveledCategory = {
  category: string;
  level: number;
}

export type Product = {
  categories: string[];
  computed_stars_avg: number;
  host: string;
  href: string;
  nb_saved_reviews: number;
  numberofratings: number;
  origin: string;
  pathname: string;
  productglobalreview: number;
  productid: string;
  producttitle: string;
  protocol: string;
  stars_avg: number;
  storeid: string;
  storename: string;
};

export type SimplifiedAuthor = {
  author_id: string;
  nb_reviews: number;
  avg_computed_stars: number;
  avg_stars: number;
};

export type AuthorData = {
  author_id: string;
  author: string;
  author_img: string;
  author_link: string;
};

export type StoreDistribution = Array<{
  count: number;
  storeid: string;
  storename: string;
}>;

export type AuthorReview = {
  id: number;
  title: string;
  content: string;
  storeid: string;
  storename: string;
}

export type StoreAuthor = {
  author_id: string;
  author: string;
  nb_reviews: number;
  product_ids: Array<string>; 
}