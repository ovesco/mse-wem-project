import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import Author from '../authors/Author';

import { Store, StoreAuthor } from '../../types';
import Api from '../../Api';

function StoreReviewAuthors(props: { store: Store }) {

  const amount = 6;
  const [authors, setAuthors] = useState<StoreAuthor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const nbPages = useMemo(() => Math.ceil(total / amount), [total]);

  const loadAuthors = (page: number = 0, amount: number) => {
    Api.getStoreAuthors(props.store.storeid, page, amount).then(({ authors, count }) => {
      setTotal(count);
      setAuthors(authors);
      setPage(page);
    });
  };

  useEffect(() => {
    loadAuthors(0, amount);
  }, []);

  return (
    <div>
      <BrowserRouter basename={`${process.env.PUBLIC_URL}/store/${props.store.id}`}>
        <div className="container mx-auto">
          <div className="flex justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-700 mb-2">Authors</h1>
              <h3 className="text-2xl font-semibold text-gray-500">People who reviewed articles from {props.store.storename}</h3>
            </div>
            <div className="flex justify-end items-center mb-4 mt-4">
              <p className="mr-3">Page {page + 1} on {nbPages}</p>
              <div className="flex">
                <div className="flex rounded bg-white border border-solid border-gray-100 overflow-hidden cursor-pointer text-3xl text-gray-800">
                  <button className={`py-1 px-3 transition-all ${page === 0  ? 'text-gray-300 cursor-default' : 'hover:bg-gray-200'}`} onClick={() => loadAuthors(page - 1, amount)}>&lt;</button>
                  <button className={`py-1 px-3 transition-all ${page === nbPages - 1  ? 'text-gray-300 cursor-default' : 'hover:bg-gray-200'}`} onClick={() => loadAuthors(page + 1, amount)}>&gt;</button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-10 mt-10">
            {authors.map(author => (
              <NavLink to={`/author/${author.author_id}`} key={author.author_id}>
                <div className="bg-white w-full rounded border border-gray-100 border-solid group hover:bg-gray-800 transform hover:scale-110 transition-all hover:shadow-2xl hover:border-gray-800">
                  <div className="w-full h-full">
                    <div className="flex p-4 items-enter">
                      <div className="flex justify-center flex-col">
                        <h3 className="font-semibold text-gray-800 group-hover:text-white">{author.author}</h3>
                        <h4 className="text-gray-600 text-xs group-hover:text-gray-300">{author.author_id}</h4>
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
                        <div className="flex flex-col items-center">
                          <p className="text-5xl font-semibold group-hover:text-white">{author.nb_reviews}</p>
                          <p className="text-gray-600 text-center group-hover:text-gray-400">Reviews given for {props.store.storename}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-5xl font-semibold group-hover:text-white">{author.product_ids.length}</p>
                          <p className="text-gray-600 text-center group-hover:text-gray-400">Articles reviewed for {props.store.storename}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
        <Switch>
          <Route path="/author/:authorId">
            <Author />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default StoreReviewAuthors;