import { useEffect, useMemo, useRef, useState } from "react";
import { useHistory, useParams } from "react-router";
import { compareTwoStrings } from 'string-similarity';
import Api from "../../Api";
import StarsDistributionChart from "../../components/charts/StarsDistributionChart";
import StoreDistributionChart from "../../components/charts/StoreDistributionChart";
import { AuthorReview, StarsDistribution, StoreDistribution } from "../../types";

function Author() {

  const history = useHistory();
  const reviewsRef = useRef<HTMLDivElement>(null);
  const { authorId } = useParams<{ authorId: string }>();
  const [starsDistribution, setStarsDistribution] = useState<StarsDistribution | null>(null);
  const [storeDistribution, setStoreDistribution] = useState<StoreDistribution | null>(null);
  const [reviews, setReviews] = useState<AuthorReview[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");

  useEffect(() => {
    Promise.all([
      Api.getAuthorStarsDistribution(authorId),
      Api.getAuthorStoreDistribution(authorId),
      Api.getAuthorReviews(authorId),
    ]).then(([ stars, stores, reviews ]) => {
      setStarsDistribution(stars);
      setStoreDistribution(stores);
      setReviews(reviews);
    });
  }, [authorId]);


  const similarityGroups = useMemo(() => {
    const groups = reviews.map(it => reviews.map(r => ({
      id: r.id,
      score: compareTwoStrings(r.content, it.content),
    })).filter(r => r.score > 0.8))
      .filter(grp => grp.length > 0);
    
    let taken: number[] = [];
    const results = [];
    for (const group of groups) {
      if (taken.includes(group[0].id)) {
        continue;
      } else {
        results.push(group);
        taken = [...taken, ...group.map(it => it.id)];
      }
    }
    return results;
  }, [reviews]);

  const stores = reviews.reduce((acc, it) => {
    if (!acc[it.storeid]) {
      acc[it.storeid] = {
        name: it.storename,
        cnt: 0,
      };
    }

    acc[it.storeid].cnt += 1;
    return acc;
  }, {} as {[key: string]: { name: string, cnt: number }});

  return (
    <div className="fixed flex justify-end h-full w-full top-0 left-0 backdrop-filter backdrop-blur-sm z-20" style={{ background: 'rgba(0,0,20,0.2)' }} onClick={() => history.push('/')}>
      <div className="h-full flex flex-col bg-gray-50 shadow-xl" style={{ width: '1000px' }} onClick={e => e.stopPropagation()}>
        <div className="grid grid-cols-4 p-5 gap-5">
          <div className="col-span-1 rounded bg-gradient-to-br from-green-400 to-blue-500 p-4 flex flex-col justify-center items-center shadow-lg">
            <h1 className="text-5xl font-semibold text-white">{similarityGroups.filter(it => it.length > 1).length}</h1>
            <h3 className="font-semibold text-white text-center">Reviews Similarity Groups</h3>
          </div>
          <div className="col-span-1 rounded bg-gradient-to-br from-yellow-400 to-red-500 p-4 flex flex-col justify-center items-center shadow-lg">
            <h1 className="text-5xl font-semibold text-white">{similarityGroups.filter(it => it.length === 1).length} <span className="opacity-30 text-xl">/{reviews.length}</span></h1>
            <h3 className="font-semibold text-white text-center">Unique Reviews without similarity</h3>
          </div>
          <div className="col-span-2 p-4">
            <h3 className="text-gray-700 text-2xl font-semibold">F1-Score based</h3>
            <p className="text-gray-600">Similarity coefficient is computed using the F1 Score for each review's content string</p>
          </div>
        </div>
        <div className="flex-1 w-full p-5 flex flex-col overflow-auto">
          <div className="flex justify-between">
            <div>
              <h4 className="text-gray-700 text-xl font-semibold">Reviews</h4>
              <h5 className="text-gray-500 text-lg mb-2">Crawled and saved</h5>
            </div>
            <div className="flex items-center">
              <select className="px-2 py-1 rounded border border-gray-100 border-solid" onChange={e => setSelectedStore(e.target.value)}>
                <option value="">All Stores</option>
                {Object.entries(stores).map(([id, data]) => <option key={id} value={id}>{data.name} ({data.cnt})</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 bg-white w-full rounded p-4 overflow-auto" style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }} ref={reviewsRef}>
            {reviews.filter(it => selectedStore === "" || it.storeid === selectedStore).map(it => (
              <div key={it.id} className="border-b border-gray-100 mb-2 pb-2">
                <p className="font-semibold">{it.title}</p>
                <p className="text-sm text-gray-700">{it.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 pb-5 px-5">
          <div className="p-4 bg-white rounded" style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
            <h4 className="text-gray-700 text-xl font-semibold">Stars Distribution</h4>
            <h5 className="text-gray-500 text-lg">Computed by aggregating every review</h5>
            {starsDistribution && (
              <StarsDistributionChart data={starsDistribution} height={250} />
            )}
          </div>
          <div className="px-4 pt-4 bg-white rounded" style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
            <h4 className="text-gray-700 text-xl font-semibold">Store Distribution</h4>
            <h5 className="text-gray-500 text-lg">Author reviews per store</h5>
            {storeDistribution && (
              <StoreDistributionChart data={storeDistribution} height={250} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Author;