import { useEffect, useState } from "react";
import Api from "../../Api";
import Stars from '../../components/Stars';
import { StarsDistribution, Store } from "../../types";
import StarsDistributionChart from '../../components/charts/StarsDistributionChart';

type OverviewProps = {
  starsDistribution: StarsDistribution,
  store: Store,
};

function Overview(props: OverviewProps) {

  return (
    <div>
      <div className="grid grid-cols-5 gap-10 mb-10">
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded p-4 shadow-xl h-32 col-span-3 items-center flex">
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="">
              <p className="font-semibold text-white text-3xl text-center">{Math.round(props.store.product_global_review_avg * 10) / 10}</p>
              <Stars className="transform m-auto" nbStars={props.store.product_global_review_avg} activeColor="#ccc" passiveColor="#3d4c63" />
              <p className="text-xs text-gray-400 text-center">Amazon Global Store Score</p>
            </div>
            <div className="">
              <p className="font-semibold text-white text-3xl text-center">{Math.round(props.store.stars_avg * 10) / 10}</p>
              <Stars className="transform m-auto" nbStars={props.store.stars_avg} activeColor="#ccc" passiveColor="#3d4c63" />
              <p className="text-xs text-gray-400 text-center">Crawled Reviews Score</p>
            </div>
            <div className="">
              <p className="font-semibold text-white text-3xl text-center">{Math.round(props.store.computed_stars_avg * 10) / 10}</p>
              <Stars className="transform m-auto" nbStars={props.store.computed_stars_avg} activeColor="#ccc" passiveColor="#3d4c63" />
              <p className="text-xs text-gray-400 text-center">Computed Score</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-red-500 rounded shadow-xl flex flex-col justify-center h-32">
          <h2 className="text-white text-4xl font-semibold text-center">{props.store.nb_saved_articles}</h2>
          <h4 className="text-white text-xl text-center">Saved Crawled Articles</h4>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded shadow-xl flex flex-col justify-center h-32">
          <h2 className="text-white text-4xl font-semibold text-center">{props.store.number_of_saved_reviews}</h2>
          <h4 className="text-white text-xl text-center">Saved Crawled Reviews</h4>
        </div>
      </div>
      <div className="p-5 bg-white rounded" style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
        <h4 className="text-gray-700 text-2xl font-semibold">Global Stars Distribution</h4>
        <h5 className="text-gray-500 text-xl">Computed by aggregating every articles</h5>
        <StarsDistributionChart data={props.starsDistribution} />
      </div>
    </div>
  )
}


function OverviewLoader(props: { store: Store }) {

  const [stars, setStars] = useState<StarsDistribution | null>(null);
  useEffect(() => {
    Api.getStoreStarsDistribution(props.store.storeid).then(res => setStars(res));
  }, [props.store]);

  return (
    <>
      {stars && <Overview starsDistribution={stars} store={props.store} />}
    </>
  )
}

export default OverviewLoader;