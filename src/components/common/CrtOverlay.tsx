import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';

export const CrtOverlay: React.FC = () => {
  const { scanlines, theme } = useVaultStore();

  if (!scanlines || theme === 'pre-war') {
    return null;
  }

  return (
    <>
      <div className="crt-vignette" />
      <div className="crt-sweep-line" />
    </>
  );
};
