import React from 'react';
import { PortraitLayout } from './PortraitLayout';
import { LandscapeLayout } from './LandscapeLayout';
import { BedLayoutProps } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const BedLayoutContainer: React.FC<BedLayoutProps> = (props) => {
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return (
    <div className="w-full max-w-[1600px] mx-auto h-full px-0 sm:px-4">
      {isLandscape ? (
        <LandscapeLayout {...props} />
      ) : (
        <PortraitLayout {...props} />
      )}
    </div>
  );
};