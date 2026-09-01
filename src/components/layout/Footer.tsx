import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import { footerColumns, socialLinks } from '../../data/content';

const paymentMethods = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay'];

export function Footer() {
  return (
    <footer className="border-t border-forest-800 bg-forest-900 text-cream-100">
      <div className="container-px py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo tone="light" />
            <p className="mt-4 font-sans text-sm leading-relaxed text-cream-100/70">
              Premium hair oil crafted with carefully selected natural ingredients to
              nourish your scalp, strengthen your roots and bring your hair back to life.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="text-cream-100/70 transition-colors hover:text-gold-light"
                >
                  <Icon name={s.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-gold-light">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => {
                  const to = l.href.startsWith('/#')
                    ? { pathname: '/', hash: l.href.slice(1) }
                    : l.href;
                  return (
                    <li key={l.label}>
                      <Link
                        to={to}
                        className="font-sans text-sm text-cream-100/70 transition-colors hover:text-cream-50"
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-gold-light">
              Follow Us
            </h4>
            <ul className="mt-5 space-y-3">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-sm text-cream-100/70 transition-colors hover:text-cream-50"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-cream-100/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-cream-100/60">
            © {new Date().getFullYear()} Verdance. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((m) => (
              <span
                key={m}
                className="rounded-sm border border-cream-100/15 bg-cream-100/5 px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-wider text-cream-100/60"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
