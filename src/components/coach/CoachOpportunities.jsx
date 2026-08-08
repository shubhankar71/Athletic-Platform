import { MapPin, Users } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getOpportunityPosts } from "../../api/mockApi.js";
import OpportunityComposer from "./OpportunityComposer.jsx";
import "../athlete/OpportunityFeed.css";

const TYPE_TONE = { recruitment: "teal", competition: "coral", workshop: "amber" };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function CoachOpportunities() {
  const { data: posts, isLoading, refetch } = useAsyncData(getOpportunityPosts, []);

  return (
    <div className="grid-2">
      <div className="stack">
        {isLoading ? (
          <Card>
            <LoadingBlock label="Loading your posts…" />
          </Card>
        ) : (
          <div className="opp-feed">
            {posts.map((post) => (
              <Card key={post.id} className="opp-feed__card">
                <div className="opp-feed__header">
                  <div>
                    <Badge tone={TYPE_TONE[post.type]}>{post.type}</Badge>
                    <h3 className="opp-feed__title">{post.title}</h3>
                    <p className="opp-feed__org">{post.location}</p>
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
                      <Users size={13} /> {post.applicants} applicants
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <OpportunityComposer onPosted={refetch} />
      </div>
    </div>
  );
}
