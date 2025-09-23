import React from 'react';

interface TemplateProps {
  textComponent: React.ReactNode;
  imageComponent: React.ReactNode;
}

export const SimpleTemplate: React.FC<TemplateProps> = ({ textComponent, imageComponent }) => {
  return (
    <div className="simple-enhanced w-full h-full flex items-center justify-center">
      {imageComponent}
      <div className="text-center z-10">
        {textComponent}
      </div>
    </div>
  );
};
