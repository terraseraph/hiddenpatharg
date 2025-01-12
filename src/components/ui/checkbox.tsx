"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
        return (
            <input
                type="checkbox"
                ref={ref}
                checked={checked}
                defaultChecked={defaultChecked}
                onChange={e => onCheckedChange?.(e.target.checked)}
                className={cn(
                    "h-4 w-4 shrink-0 rounded-sm border border-slate-200 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
                    className
                )}
                {...props}
            />
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox }; 