import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../lib/format';
import { newsletterService } from '../../services/misc';
import { ApiError } from '../../lib/api';

type Status = 'idle' | 'error' | 'submitting' | 'success';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('Please enter a valid email address.');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      await newsletterService.subscribe(email.trim());
      setStatus('success');
      setEmail('');
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="scroll-mt-24 bg-ivory py-20 lg:py-28">
      <div className="container-px">
        <Reveal className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="eyebrow">Newsletter</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">Make Hair Care a Ritual</h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-charcoal-light">
            Join our community for hair care tips, product updates and exclusive offers.
          </p>

          <form onSubmit={onSubmit} className="mt-8 w-full" noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Enter your email address"
                aria-invalid={status === 'error'}
                className={cn(
                  'h-12 flex-1 rounded-md border bg-cream-50 px-4 font-sans text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest-700',
                  status === 'error' ? 'border-red-400' : 'border-forest-200',
                )}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="h-12 rounded-md bg-forest-800 px-7 font-sans text-sm font-medium tracking-wide text-cream-50 shadow-soft transition-all hover:bg-forest-900 hover:shadow-lift active:translate-y-px disabled:opacity-60"
              >
                {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>

            <div className="mt-3 min-h-[1.25rem] text-left sm:text-center">
              {status === 'error' && (
                <p className="font-sans text-xs text-red-500">{errorMsg}</p>
              )}
              {status === 'success' && (
                <p className="flex items-center justify-center gap-1.5 font-sans text-xs font-medium text-forest-700">
                  <Icon name="check-circle" className="h-4 w-4" />
                  Thank you — please check your inbox to confirm.
                </p>
              )}
              {status === 'idle' && (
                <p className="font-sans text-xs text-charcoal-muted">
                  No spam. Unsubscribe anytime.
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
