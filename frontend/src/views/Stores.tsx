import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Store } from '../types';
import Api from '../Api';
import Stars from '../components/Stars';

function Stores() {

  const amount = 9;
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const nbPages = useMemo(() => Math.ceil(total / amount), [total]);

  const loadStores = (page: number = 0, amount: number = 9) => {
    Api.getStores(page, amount).then(({ stores, total }) => {
      setTotal(total);
      setStores(stores);
      setPage(page);
    });
  };

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <div>
      <div className="container mx-auto pt-10">
        <h1 className="text-6xl font-semibold text-gray-800 mb-2">Stores</h1>
        <h3 className="text-4xl font-semibold text-gray-500">From which a few products were crawled</h3>
        <div className="flex justify-end items-center mb-4 mt-4">
          <p className="mr-3">Page {page + 1} on {nbPages}</p>
          <div className="flex">
            <div className="flex rounded bg-white border border-solid border-gray-100 overflow-hidden cursor-pointer text-3xl text-gray-800">
              <button className={`py-1 px-3 transition-all ${page === 0  ? 'text-gray-300 cursor-default' : 'hover:bg-gray-200'}`} onClick={() => loadStores(page - 1)}>&lt;</button>
              <button className={`py-1 px-3 transition-all ${page === nbPages - 1  ? 'text-gray-300 cursor-default' : 'hover:bg-gray-200'}`} onClick={() => loadStores(page + 1)}>&gt;</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-10">
          {stores.map(store => (
            <NavLink to={`/store/${store.id}`} key={`${store.id}`} className="rounded bg-white p-5 border border-solid border-gray-100 cursor-pointer group transform hover:scale-105 transition-all hover:bg-gray-800 hover:shadow-2xl hover:border-gray-800">
              <h4 className="text-2xl font-semibold text-gray-700 group-hover:text-white">{store.storename}</h4>
              <h5 className="text-gray-600 group-hover:text-gray-200">{store.number_of_saved_reviews} Reviews - {store.nb_saved_articles} Articles</h5>
              <div className="flex justify-between mt-4">
                <div>
                  <div className="text-xs group-hover:text-gray-400">Users Global Rating</div>
                  <Stars nbStars={store.stars_avg} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs group-hover:text-gray-400 text-right">Sentiment Analysis</div>
                  <Stars nbStars={store.computed_stars_avg} />
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Stores;