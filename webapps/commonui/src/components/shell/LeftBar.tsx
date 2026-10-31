'use client';

import { Separator } from '@microrealestate/commonui/components/ui/separator';
import { cn } from '@microrealestate/commonui/utils';
import { LuxeLogo } from '../LuxeLogo';
import { AppMenu } from './AppMenu';
import type { MenuItem } from './SideMenuButton';

export function LeftBar({
  className,
  organizationName,
  menuItems,
  selectedMenuItem,
  onMenuClick
}: {
  className?: string;
  organizationName?: string;
  menuItems: MenuItem[];
  selectedMenuItem: MenuItem | null;
  onMenuClick: (item: MenuItem) => void;
}) {
  return (
    <div
      className={cn(
        'bg-sidebar text-sidebar-foreground flex flex-col fixed top-0 w-60 h-full z-50 border-r border-sidebar-border',
        className
      )}
    >
      <div className="px-4 pt-5">
        <LuxeLogo tone="onDark" showLocation={false} className="h-[52px]" />
        {organizationName ? (
          <div className="whitespace-nowrap overflow-hidden text-ellipsis font-serif text-lg text-white mt-3">
            {organizationName}
          </div>
        ) : null}
      </div>
      <Separator className="bg-sidebar-border mt-4" />
      <AppMenu
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItem}
        onMenuClick={onMenuClick}
      />
    </div>
  );
}
