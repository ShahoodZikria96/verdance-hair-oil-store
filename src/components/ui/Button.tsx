import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide rounded-md transition-all duration-300 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-45 disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-forest-800 text-cream-50 hover:bg-forest-900 shadow-soft hover:shadow-lift active:translate-y-px',
  secondary:
    'bg-transparent text-forest-800 border border-forest-300 hover:border-forest-800 hover:bg-forest-50 active:translate-y-px',
  ghost: 'bg-transparent text-forest-800 hover:bg-forest-50',
  dark: 'bg-charcoal text-cream-50 hover:bg-black shadow-soft hover:shadow-lift active:translate-y-px',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-4 py-2.5',
  md: 'text-sm px-6 py-3',
  lg: 'text-sm px-8 py-4',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type ButtonAsLink = CommonProps & { as: 'link'; to: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
  >;
type ButtonAsAnchor = CommonProps & { as: 'a'; href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, children, ...props },
  ref,
) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  );

  if (props.as === 'link') {
    const { as: _as, to, ...rest } = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (props.as === 'a') {
    const { as: _as, ...rest } = props;
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { as: _as, ...rest } = props;
  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  );
});
