import { api } from './api';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export interface ReviewsResponse {
  data: Review[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  summary: { averageRating: number; totalReviews: number };
}

export function getProductReviews(productId: string, page = 1) {
  return api.get<ReviewsResponse>(`/reviews/product/${productId}?page=${page}`);
}

export interface CanReviewResponse {
  canReview: boolean;
  reason: 'already_reviewed' | 'not_purchased' | null;
}

export function canReviewProduct(productId: string, accessToken: string | null) {
  return api.get<CanReviewResponse>(`/reviews/product/${productId}/can-review`, accessToken);
}

export function createReview(
  payload: { productId: string; rating: number; title?: string; comment: string },
  accessToken: string | null,
) {
  return api.post<Review>('/reviews', payload, accessToken);
}

export function deleteReview(id: string, accessToken: string | null) {
  return api.delete(`/reviews/${id}`, accessToken);
}
