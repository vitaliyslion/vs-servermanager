import React from "react";

export interface FormFieldProps {
  error?: string;
  className?: string;
}

export const FormField: React.FC<React.PropsWithChildren<FormFieldProps>> = ({
  children,
  className,
  error,
}) => (
  <div className={className}>
    {children}
    {error && <div className="text-red-500 text-sm">{error}</div>}
  </div>
);
