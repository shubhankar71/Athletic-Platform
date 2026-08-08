import { MapPin, Users } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getOpportunityPosts } from "../../api/mockApi.js";
import "./OpportunityFeed.css";

const TYPE_TONE = {
  recruitment: "teal",
  competition: "coral",
  workshop: "amber",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function OpportunityFeed() {
  const { data: posts, isLoading } = useAsyncData(getOpportunityPosts, []);

  if (isLoading) {
    return (
      <Card>
        <LoadingBlock label="Loading opportunity feed…" />
      </Card>
    );
  }

  return (
    <div className="opp-feed">
      {posts.map((post) => (
        <Card key={post.id} className="opp-feed__card">
          <div className="opp-feed__header">
            <div>
              <Badge tone={TYPE_TONE[post.type]}>{post.type}</Badge>
              <h3 className="opp-feed__title">{post.title}</h3>
              <p className="opp-feed__org">
                {post.org} · posted by {post.postedBy}
              </p>
            </div>
            <p className="opp-feed__date">{formatDate(post.postedAt)}</p>
          </div>

          <p className="opp-feed__summary">{post.summary}</p>

          <div className="opp-feed__footer">
            <div className="opp-feed__meta">
              <span>
                <MapPin size={13} /> {post.location}
              </span>
              <span>
                <Users size={13} /> {post.applicants} interested
              </span>
            </div>
            <Button variant="secondary" size="sm">
              View details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
