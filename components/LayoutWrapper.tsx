'use client';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {children}
    </div>
  );
}
