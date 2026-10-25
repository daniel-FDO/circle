import FeedList from "../components/home/FeedList";
import PageHeader from "../components/home/PageHeader";
import { useFeed } from "../layouts/feedContext";

// Every post, regardless of the user's chosen circles
const Explore = () => {
  const { posts } = useFeed();
  return (
    <>
      <PageHeader title="Explore" />
      <div className="space-y-4">
        <FeedList posts={posts} emptyMessage="Nothing here yet." />
      </div>
    </>
  );
};

export default Explore;
