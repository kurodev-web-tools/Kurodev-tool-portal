import React from 'react';

interface TemplateProps {
  textComponent: React.ReactNode;
  imageComponent: React.ReactNode;
  subText?: string;
}

export const CoolTemplate: React.FC<TemplateProps> = ({ textComponent, imageComponent, subText }) => {
  return (
    <div className="cool-enhanced w-full h-full flex items-center justify-center">
      <div className="digital-overlay"></div>
      <div className="light-ray-1"></div>
      <div className="light-ray-2"></div>
      {imageComponent}
      <div className="z-10 text-center">
        <div className="cool-title">
          {textComponent}
        </div>
        {subText && (
          <div className="cool-sub-text mt-2.5">
            {subText}
          </div>
        )}
      </div>
    </div>
  );
};
