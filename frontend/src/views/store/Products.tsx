import { useCallback, useEffect, useState } from 'react';
import Api from '../../Api';
import { LeveledCategory, Product, Store } from '../../types';

type CategoryButtonProps = {
  onClick: Function;
  level: number;
  title: string;
  selected: boolean;
};

function CategoryButton(props: CategoryButtonProps) {
  const [themeClassic, themeSelected] = [
    ['bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200', 'bg-gray-800 border-gray-800'],
    ['bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200', 'bg-blue-800 border-blue-800'],
    ['bg-green-100 border-green-200 text-green-800 hover:bg-green-200', 'bg-green-800 border-green-800'],
    ['bg-red-100 border-red-200 text-red-800 hover:bg-red-200', 'bg-red-800 border-red-800'],
    ['bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200', 'bg-purple-800 border-purple-800'],
    ['bg-pink-100 border-pink-200 text-pink-800 hover:bg-pink-200', 'bg-pink-800 border-pink-800'],
  ][props.level - 1];

  return (
    <div onClick={() => props.onClick()} className={`${props.selected ? `${themeSelected} text-white scale-105 shadow-xl` : themeClassic} transform flex rounded border border-solid text-xs cursor-pointer transition-all mr-3 mb-3`}>
      <div className="opacity-50 font-semibold py-1 px-2 bg-gray-300">{props.level}</div>
      <div className=" py-1 px-2">{props.title}</div>
    </div>
  );
}

type ProductsProps = {
  categories: LeveledCategory[];
  store: Store;
};

function Products(props: ProductsProps) {

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);

  const loadProducts = useCallback(() => {
    setPage(0);
    Api.getCategoriesProducts(props.store.storeid, selectedCategories, page, 9)
      .then(res => setProducts(res));
  }, [selectedCategories, page, props.store.storeid]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategories, page, loadProducts]);

  useEffect(() => {
    loadProducts();
  });

  const categoryClicked = (title: string) => {
    const nextCategories = [...selectedCategories];
    const id = nextCategories.findIndex(it => it === title);
    if (id >= 0) {
      nextCategories.splice(id, 1);
    } else {
      nextCategories.push(title);
    }
    setSelectedCategories(nextCategories);
  };

  return (
    <div>
      <div className="bg-white p-4 shadow-lg mb-4 rounded">
        <h3 className="text-3xl font-semibold text-gray-700 mb-4">Categories</h3>
        <div className="flex flex-wrap">
          {props.categories.map(it => <CategoryButton key={`${it.category}-${it.level}`} selected={selectedCategories.includes(it.category)} title={it.category}
            level={it.level} onClick={() => categoryClicked(it.category)} />)}
        </div>
      </div>
      <div>
        {products.map(it => (
          <div key={it.productid} className="bg-white rounded p-4 border border-gray-100 border-solid mb-4">
            <div className="flex">
              <div>
              </div>
              <div>
                <div className="flex">
                  {it.categories.map((c, i) => <div key={c} className="text-gray-500 text-xs">{c} {i < it.categories.length - 1 && <span className="text-gray-400 pl-1 pr-2">{'>'}</span>}</div>)}
                </div>
                <h3 className="">{it.producttitle}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsLoader(props: { store: Store }) {

  const [categories, setCategories] = useState<LeveledCategory[]>([]);
  useEffect(() => {
    Api.getStoreProductsCategories(props.store.storeid).then(res => setCategories(res));
  }, [props.store]);

  return (
    <Products store={props.store} categories={categories} />
  );
}

export default ProductsLoader;