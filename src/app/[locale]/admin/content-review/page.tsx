import { ContentReviewClient } from "./content-review-client";

export const metadata = {
  title: "Content Review",
  robots: { index: false, follow: false },
};

export default function ContentReviewPage() {
  return <ContentReviewClient />;
}
