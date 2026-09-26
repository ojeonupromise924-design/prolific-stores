'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth-store';
import {
  getProductReviews, canReviewProduct, createReview, deleteReview,
  type ReviewsResponse,
} from '../lib/reviews';
import { ApiError } from '../lib/api';
import { StarRating } from './star-rating';
import { StarPicker } from './star-picker';
import { showToast } from './toast';

export function ProductReviews({ productId }: { productId: string }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewBlockedReason, setReviewBlockedReason] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(() => {
    getProductReviews(productId).then(setReviews).catch(() => {});
  }, [productId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

    useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!user) {
        if (!cancelled) setCanReview(false);
        return;
      }
      try {
        const res = await canReviewProduct(productId, accessToken);
        if (!cancelled) {
          setCanReview(res.canReview);
          setReviewBlockedReason(res.reason);
        }
      } catch {
        // no-op
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, accessToken, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await createReview({ productId, rating, title: title || undefined, comment }, accessToken);
      showToast('Review posted');
      setShowForm(false);
      setRating(0);
      setTitle('');
      setComment('');
      setCanReview(false);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not post review');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Delete this review?')) return;
    await deleteReview(reviewId, accessToken);
    refresh();
  }

  if (!reviews) return null;

  return (
    <div className="border-t border-line py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-ink">Reviews</h2>
          {reviews.summary.totalReviews > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={reviews.summary.averageRating} size={16} />
              <span className="text-sm text-ink/60">
                {reviews.summary.averageRating.toFixed(1)} out of 5 ({reviews.summary.totalReviews} review
                {reviews.summary.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink/50">No reviews yet.</p>
          )}
        </div>

        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-dark"
          >
            Write a Review
          </button>
        )}
        {user && !canReview && reviewBlockedReason === 'already_reviewed' && (
          <span className="text-xs text-ink/40">You&apos;ve already reviewed this product</span>
        )}
        {user && !canReview && reviewBlockedReason === 'not_purchased' && (
          <span className="text-xs text-ink/40">Purchase this product to leave a review</span>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-line bg-white p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Your Rating</p>
          <StarPicker value={rating} onChange={setRating} />

          <input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-4 w-full rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-forest"
          />
          <textarea
            placeholder="Share your experience with this product..."
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-3 w-full rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-forest"
          />

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-black/4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col divide-y divide-line">
        {reviews.data.length === 0 ? (
          <p className="py-6 text-sm text-ink/40">Be the first to review this product.</p>
        ) : (
          reviews.data.map((review) => (
            <div key={review.id} className="py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-medium text-forest-dark">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && <p className="mt-2 text-sm font-medium text-ink">{review.title}</p>}
                </div>
                {user && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-xs text-ink/30 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/70">{review.comment}</p>
              <p className="mt-2 text-xs text-ink/40">
                {review.user.firstName} {review.user.lastName[0]}. ·{' '}
                {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}