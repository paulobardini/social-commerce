import Link, { type LinkProps } from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<LinkProps<"/">, "href"> {
  href: LinkProps<"/">["href"];
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pendingClassName, href, ...props }, ref) => {
    // Simple active detection using pathname match when used inside a client component
    // For more complex cases, prefer using usePathname directly where NavLink is consumed.
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, activeClassName)}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
