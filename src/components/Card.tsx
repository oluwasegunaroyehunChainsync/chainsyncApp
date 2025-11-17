import React, { ReactNode } from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, variant = 'elevated', padding = 'md', className }: CardProps) {
  const paddingClass = { sm: 'p-3', md: 'p-6', lg: 'p-8' };
  const variantClass = {
    elevated: 'bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow',
    outlined: 'bg-white rounded-lg border border-gray-300',
  };

  return (
    <div className={cn(variantClass[variant], paddingClass[padding], className)}>
      {children}
    </div>
  );
}

function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('border-b border-gray-200 pb-4 mb-4', className)}>{children}</div>;
}

function CardBody({ children, className }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn('border-t border-gray-200 pt-4 mt-4', className)}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
