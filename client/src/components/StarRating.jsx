import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 0, max = 5, interactive = false, onRatingChange, size = 18 }) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={starValue}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`transition-colors ${
              interactive
                ? 'cursor-pointer hover:scale-110 active:scale-95'
                : 'cursor-default pointer-events-none'
            }`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
