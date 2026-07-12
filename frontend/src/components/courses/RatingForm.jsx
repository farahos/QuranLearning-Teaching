import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "../common/Button";
import { Textarea } from "../common/Textarea";

export function RatingForm({ initialRating = 0, initialComment = "", onSubmit, loading = false, submitLabel = "Submit rating" }) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [hover, setHover] = useState(0);
  const [touched, setTouched] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (!rating) return;
    onSubmit({ rating, comment });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <span className="label">
          Your rating <span className="required-star">*</span>
        </span>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
            >
              <Star size={24} className={(hover || rating) >= value ? "fill-quran-gold text-quran-gold" : "text-quran-line"} />
            </button>
          ))}
        </div>
        {touched && !rating && <p className="field-error">Choose a star rating</p>}
      </div>
      <Textarea label="Your feedback" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share how this course helped you..." />
      <Button type="submit" variant="primary" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
