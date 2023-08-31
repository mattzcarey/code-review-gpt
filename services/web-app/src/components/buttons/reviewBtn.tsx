import React from 'react';

interface ReviewButtonProps {
  onClick: () => void;
}

const ReviewButton = ({ onClick }: ReviewButtonProps): JSX.Element => {
  return (
      <button 
        className="hover:underline m-2 p-[10px] w-20 bg-black text-white rounded-lg border-2 border-black"
        onClick={onClick}
      >
        Review
      </button>
  );
};

export default ReviewButton;