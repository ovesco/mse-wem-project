import { AuthorData, SimplifiedAuthor } from "../types";
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from "react";
import Api from "../Api";
import Spinner from './Spinner';
import Stars from "./Stars";
 
type Props = {
  data: SimplifiedAuthor;
};

function AuthorCard(props: Props) {

  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState<AuthorData | null>(null);

  useEffect(() => {
    Api.getAuthor(props.data.author_id).then((res) => {
      setIsLoading(false);
      setAuthor(res);
    });
  }, [props.data.author_id]);

  return (
    <NavLink to={`/${props.data.author_id}`}>
      <div className="bg-white h-48 w-full rounded border border-gray-100 border-solid group hover:bg-gray-800 transform hover:scale-110 transition-all hover:shadow-2xl hover:border-gray-800">
        {isLoading && (
          <div className="w-full h-full flex justify-center items-center">
            <Spinner className="" />
          </div>
        )}
        {!isLoading && author && (
          <div className="w-full h-full">
            <div className="flex p-4 items-enter">
              {author.author_img && <img src={author.author_img} className="mr-2 rounded" alt="author img" />}
              <div className="flex justify-center flex-col">
                <h3 className="font-semibold text-gray-800 group-hover:text-white">{author.author}</h3>
                <h4 className="text-gray-600 text-xs group-hover:text-gray-300">{author.author_id}</h4>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-3 gap-3 px-5">
                <div className="flex flex-col items-center bg-gray-800 rounded justify-center group-hover:bg-gray-700">
                  <p className="text-3xl text-white font-semibold">{props.data.nb_reviews}</p>
                  <p className="text-xs text-gray-300 text-center">Number of Reviews</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-semibold group-hover:text-white">{Math.round(props.data.avg_stars * 100) / 100}</p>
                  <Stars nbStars={props.data.avg_stars} className="scale-75 transform" />
                  <p className="text-xs text-gray-600 text-center group-hover:text-gray-400">Given Stars Score</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-semibold group-hover:text-white">{Math.round(props.data.avg_computed_stars * 100) / 100}</p>
                  <Stars nbStars={props.data.avg_computed_stars} className="scale-75 transform" />
                  <p className="text-xs text-gray-600 text-center group-hover:text-gray-400">Sentiment Analysis Score</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </NavLink>
  )
};

export default AuthorCard;