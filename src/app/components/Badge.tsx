import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
};

const Badge = ({ children }: BadgeProps) => {
  return (
    <li className="rounded-lg italic text-gray-400 text-xs">{children}</li>
  );
};

export default Badge;
