import type { ReactNode } from 'react';
import { LuxeLogo } from './LuxeLogo';

interface PublicLayoutProps {
  subtitle?: string;
  illustration?: ReactNode;
  children: ReactNode;
}

export default function PublicLayout({
  subtitle,
  illustration,
  children
}: PublicLayoutProps) {
  return (
    <div className="flex h-screen bg-white dark:bg-background">
      <div className="hidden md:flex flex-col items-center justify-center space-y-20 text-center font-medium bg-luxe-navy text-white/95 w-xl border-r-4 border-luxe-gold">
        <div className="flex flex-col items-center space-y-4">
          <LuxeLogo tone="onDark" className="h-20" />
          {subtitle && (
            <div className="font-serif text-xl tracking-widest text-luxe-gold-light uppercase">
              {subtitle}
            </div>
          )}
        </div>
        {illustration}
      </div>
      <div className="relative size-full">
        <div className="md:hidden flex justify-center absolute top-30 w-full">
          <LuxeLogo tone="onLight" className="h-14" />
        </div>
        <div className="flex flex-col justify-center size-full">{children}</div>
      </div>
    </div>
  );
}
