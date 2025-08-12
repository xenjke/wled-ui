import React from "react";
import clsx from "clsx";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => (
  <div
    className={clsx(
      "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md",
      className
    )}
    {...rest}
  />
);
