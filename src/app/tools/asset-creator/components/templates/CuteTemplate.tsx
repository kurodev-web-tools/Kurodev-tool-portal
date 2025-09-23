import React from 'react';

interface TemplateProps {
  textComponent: React.ReactNode;
  imageComponent: React.ReactNode;
}

export const CuteTemplate: React.FC<TemplateProps> = ({ textComponent, imageComponent }) => {
  return (
    <div className="cute-enhanced w-full h-full flex items-center justify-center">
      <div className="dot-pattern"></div>
      <div className="blob b1"></div>
      <div className="blob b2"></div>
      {imageComponent}
      <div className="z-10">
        {textComponent}
      </div>
    </div>
  );
};
