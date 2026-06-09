import { useState } from 'react';

const StarRating = ({ value, onChange, count = 5, size = 24 }) => {
  const [hover, setHover] = useState(0);
  const currentValue = hover || value;

  const handleClick = (index) => {
    onChange(index);
  };

  const handleMouseEnter = (index) => {
    setHover(index);
  };

  const handleMouseLeave = () => {
    setHover(0);
  };

  return (
    <div className="pm-star-rating" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: count }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= currentValue;
        return (
          <button
            key={starIndex}
            type="button"
            className={`pm-star-rating-star ${isFilled ? 'pm-star-rating-star-filled' : ''}`}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            style={{ width: size, height: size }}
            aria-label={`${starIndex} 星`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;