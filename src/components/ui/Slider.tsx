import React from "react";
import clsx from "clsx";

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  onChange,
  value,
  className,
  ...rest
}) => (
  <input
    type="range"
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    className={clsx(
      "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider",
      className
    )}
    {...rest}
  />
);
