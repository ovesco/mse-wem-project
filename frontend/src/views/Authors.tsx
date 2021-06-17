import { useEffect, useMemo, useState } from 'react';

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { SimplifiedAuthor } from '../types';
import Author from './authors/Author';
import Api from '../Api';
import AuthorCard from '../components/AuthorCard';

function Authors() {

  const amount = 6;
  const [authors, setAuthors] = useState<SimplifiedAuthor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const nbPages = useMemo(() => Math.ceil(total / amount), [total]);

  const loadAuthors = (page: number = 0, amount: number) => {
    Api.getAuthors(page, amount).then(({ authors, total }) => {
      setTotal(total);
      setAuthors(authors);
      setPage(page);
    });
  };

  useEffect(() => {
    loadAuthors(0, amount);
  }, []);

  return (
    <div>
      <BrowserRouter basename={`${process.env.PUBLIC_URL}/authors`}>
        <div className="container mx-auto pt-10">
          <h1 className="text-6xl font-semibold text-gray-800 mb-2">Authors</h1>
          <h3 className="text-4xl font-semibold text-gray-500">People who reviewed articles</h3>
          <div className="flex justify-end items-center mb-4 mt-4">
            <p className="mr-3">Page {page + 1} on {nbPages}</p>
            <div className="flex">
              <div className="flex rounded bg-white border border-solid border-gray-100 overflow-hidden cursor-pointer text-3xl text-gray-800">
                <button className={`py-1 px-3 transition-all ${page === 0  ? 'text-gray-300 cursor-default' : 'hover:bg-gray-200'}`} onClick={() => loadAuthors(page - 1, amount)}>&lt;</button>
                <button className={`py-1 px-3 transition-all ${page === nbPages - 1  ? 'text-gray-300 cursor-default' : 'hover:bg-gray-200'}`} onClick={() => loadAuthors(page + 1, amount)}>&gt;</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-10">
            {authors.map(author => <AuthorCard data={author} key={author.author_id} />)}
          </div>
        </div>
        <Switch>
          
          <Route path="/:authorId">
            <Author />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default Authors;