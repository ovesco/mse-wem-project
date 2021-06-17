import { useParams, NavLink, BrowserRouter, Route, Switch } from 'react-router-dom';

import { Store as StoreData } from '../types';
import Products from './store/Products';
import Overview from './store/Overview';
import StoreReviewAuthors from './store/StoreReviewAuthors';
import { useEffect, useState } from 'react';
import Api from '../Api';

type StoreProps = {
  store: StoreData;
}

function Store({ store }: StoreProps) {

  return (
    <BrowserRouter basename={`${process.env.PUBLIC_URL}/store/${store.id}`}>
      <div className="container mx-auto pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-6xl font-semibold text-gray-800 mb-2">
            {store.storename}
          </h1>
          <div className="flex">
            <NavLink to="/" exact className="py-3 px-5 rounded font-semibold" activeClassName="text-white bg-gray-800">Overview</NavLink>  
            <NavLink to="/reviews-authors" className="py-3 px-5 rounded font-semibold" activeClassName="text-white bg-gray-800">Reviews Authors</NavLink>
          </div>  
        </div>
        <div className="mt-10">
          <Switch>
            <Route exact path="/">
              <Overview store={store} />
            </Route>
            <Route exact path="/reviews-authors">
              <StoreReviewAuthors store={store} />
            </Route>
            <Route exact path="/products">
              <Products store={store} />
            </Route>
          </Switch>
        </div>
        {/*
        <div className="mt-3 grid grid-cols-3 gap-10">
          <div className="col-span-1">
            <div className="bg-gray-800 rounded p-4 shadow-xl h-32 flex items-center">
              <div className="grid grid-cols-3 gap-4">
                <div className="">
                  <p className="font-semibold text-white text-3xl text-center">{Math.round(store.product_global_review_avg * 10) / 10}</p>
                  <Stars className="transform scale-75" nbStars={store.product_global_review_avg} activeColor="#ccc" passiveColor="#3d4c63" />
                  <p className="text-xs text-gray-400 text-center">Amazon Global Store Score</p>
                </div>
                <div className="">
                  <p className="font-semibold text-white text-3xl text-center">{Math.round(store.stars_avg * 10) / 10}</p>
                  <Stars className="transform scale-75" nbStars={store.stars_avg} activeColor="#ccc" passiveColor="#3d4c63" />
                  <p className="text-xs text-gray-400 text-center">Crawled Reviews Score</p>
                </div>
                <div className="">
                  <p className="font-semibold text-white text-3xl text-center">{Math.round(store.computed_stars_avg * 10) / 10}</p>
                  <Stars className="transform scale-75" nbStars={store.computed_stars_avg} activeColor="#ccc" passiveColor="#3d4c63" />
                  <p className="text-xs text-gray-400 text-center">Computed Score</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <Switch>
              <Route exact path="/">
                <Overview store={store} />
              </Route>
              <Route exact path="/robots">
              robots
              </Route>
              <Route exact path="/products">
                <Products store={store} />
              </Route>
            </Switch>
          </div>
        </div>
        */}
      </div>
    </BrowserRouter>
  )
}

type RouteParams = {
  storeid: string;
};

function StoreLoader() {
  const { storeid } = useParams<RouteParams>();
  const [store, setStore] = useState<StoreData | null>(null);

  useEffect(() => {
    Api.getStore(storeid).then(res => setStore(res));
  }, [storeid]);

  return (
    <>
      {store && (<Store store={store} />)}
    </>
  );
}

export default StoreLoader;