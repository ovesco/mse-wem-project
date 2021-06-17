import { NavLink, useLocation } from "react-router-dom";

import Spinner from "../components/Spinner";
import React, { useEffect, useRef, useState } from "react";
import { Store as StoreData, StoreAuthor } from "../types";
import Api from "../Api";

type SearchResponse = {
  authors: StoreAuthor[],
  stores: StoreData[],
};

function useOutsideAlerter(ref: React.RefObject<HTMLDivElement>, callback: Function) {
  useEffect(() => {
      function handleClickOutside(e: any) {
          if (ref && ref.current && !ref.current.contains(e.target)) {
              callback();
          }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [ref]);
}


function SearchBar() {

  const location = useLocation();
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<number>(null);

  useEffect(() => {
    setSearching(false);
    setResults(null);
    setSearchValue('');
  }, [location]);

  useOutsideAlerter(wrapperRef, () => {
    setSearching(false);
    setResults(null);
    setSearchValue('');
  });

  useEffect(() => {
    if (searchValue.trim() === '') {
      setSearching(false);
      setResults(null);
    } else {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      setSearching(true);
      // @ts-ignore
      timeout.current = setTimeout(() => {
        Api.search(searchValue).then(res => {
          setResults(res);
          setSearching(false);
        });
      }, 800);
    }
  }, [searchValue]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input type="text" className="rounded transition-all bg-white border border-solid border-gray-100 px-3 py-2 outline-none focus:border-gray-300 focus:shadow-xl relative" placeholder="Search stores & authors" value={searchValue} onChange={e => setSearchValue(e.target.value)} />
      {searching && (
        <div className="absolute w-5 h-5 top-0 right-0 mt-3 mr-3 flex items-center justify-center">
          <Spinner className="opacity-50" />
        </div>
      )}
      {results && (
        <div className="absolute z-20 top-0 mt-12 w-full rounded bg-white shadow-xl overflow-hidden">
          <div className="px-4 py-2 bg-gradient-to-br from-gray-700 to-gray-800">
            <div className="font-semibold text-lg text-white">Stores</div>
            <div className="text-xs text-gray-200">Searching by name</div>
          </div>
          {results.stores.length === 0 && <div className="p-3 text-gray-400 text-sm">No stores found</div>}
          {results.stores.map(it => (
            <NavLink to={`/store/${it.id}`} className="border-b border-solid border-gray-100 block py-1 px-4 hover:bg-gray-100 transition-all">
              <h3 className="font-semibold text-gray-700">{it.storename}</h3>
              <h5 className="text-gray-500 text-sm">{it.number_of_saved_reviews} Reviews - ${it.nb_saved_articles} Articles</h5>
            </NavLink>
          ))}
          <div className="px-4 py-2 bg-gradient-to-br from-gray-700 to-gray-800">
            <div className="font-semibold text-lg text-white">Authors</div>
            <div className="text-xs text-gray-200">Searching by reviews content</div>
          </div>
          {results.authors.length === 0 && <div className="p-3 text-gray-400 text-sm">No authors found</div>}
          {results.authors.map(it => (
            <NavLink to={`/authors/${it.author_id}`} className="border-b border-solid border-gray-100 block py-1 px-4 hover:bg-gray-100 transition-all">
              <h3 className="font-semibold text-gray-700">{it.author}</h3>
              <h5 className="text-gray-500 text-sm">{it.nb_reviews} Review{it.nb_reviews === 1 ? '' : 's'}</h5>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
