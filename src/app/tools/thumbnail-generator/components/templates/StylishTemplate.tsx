import React from 'react';

interface TemplateProps {
  textComponent: React.ReactNode;
  imageComponent: React.ReactNode;
}

export const StylishTemplate: React.FC<TemplateProps> = ({ textComponent, imageComponent }) => {
  return (
    <div className="stylish-enhanced w-full h-full flex items-center justify-center">
      <div className="abstract-shape s1"></div>
      <div className="abstract-shape s2"></div>
      {imageComponent}
      <div className="z-10">
        {textComponent}
      </div>
    </div>
  );
};
