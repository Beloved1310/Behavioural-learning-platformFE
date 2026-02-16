import React, { useState } from 'react';
import { TutorHeader } from './TutorHeader';
import { Footer } from './Footer';

interface TutorLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  showFooter?: boolean;
  footerVariant?: 'default' | 'minimal';
}

export const TutorLayout: React.FC<TutorLayoutProps> = ({
  children,
  fullHeight = false,
  showFooter = true,
  footerVariant = 'default',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TutorHeader
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        showMobileMenuButton={true}
      />
      <main className={`flex-1 ${fullHeight ? 'h-full' : ''}`}>{children}</main>
      {/* Footer - Same as student layout */}
      {showFooter && <Footer variant={footerVariant} />}
    </div>
  );
};
