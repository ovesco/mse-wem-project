import {
  AuthorData,
  AuthorReview,
  LeveledCategory,
  Product,
  SimplifiedAuthor,
  StarsDistribution,
  Store,
  StoreAuthor,
  StoreDistribution
} from "./types";

class API {

  async query(path: string, params: Object = {}) {
    return fetch(`http://localhost:5000${path}`, params).then(res => res.json()).catch(console.error);
  }

  async getStores(page: number, amount: number): Promise<{ stores: Store[], total: number }> {
    return this.query(`/stores?page=${page}&amount=${amount}`);
  }

  async getStore(key: string): Promise<Store> {
    return this.query(`/store?id=${key}`);
  }

  async getStoreStarsDistribution(id: string): Promise<StarsDistribution> {
    return this.query(`/store-stars-distribution?storeid=${id}`);
  }

  async getStoreProductsCategories(id: string): Promise<LeveledCategory[]> {
    return this.query(`/store-products-categories?storeid=${id}`);
  }

  async getCategoriesProducts(sid: string, categories: string[], page: number, amount: number): Promise<Product[]> {
    return this.query(`/categories-products?storeid=${sid}&page=${page}&amount=${amount}`, {
      method: 'POST',
      body: JSON.stringify({ categories }),
    });
  };

  async getAuthors(page: number, amount: number): Promise<{ authors: SimplifiedAuthor[], total: number }> {
    return this.query(`/authors?page=${page}&amount=${amount}`);
  }

  async getAuthor(authorid: string): Promise<AuthorData> {
    return this.query(`/author?authorid=${authorid}`);
  }

  async getAuthorStarsDistribution(authorid: string): Promise<StarsDistribution> {
    return this.query(`/author-stars-distribution?authorid=${authorid}`);
  }

  async getAuthorStoreDistribution(authorid: string): Promise<StoreDistribution> {
    return this.query(`/author-store-distribution?authorid=${authorid}`);
  }

  async getAuthorReviews(authorid: string): Promise<AuthorReview[]> {
    return this.query(`/author-reviews?authorid=${authorid}`);
  }

  async getStoreAuthors(storeid: string, page: number, amount: number): Promise<{ authors: StoreAuthor[], count: number }> {
    return this.query(`/store-authors?storeid=${storeid}&page=${page}&amount=${amount}`).then(res => ({
      authors: res.authors,
      count: res.count.count,
    }));
  }

  async search(term: string): Promise<{ authors: StoreAuthor[], stores: Store[] }> {
    return this.query(`/search`, {
      method: 'POST',
      body: term
    });
  }
}

export default new API();