import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { authService } from '../services/auth';
import { ApiError } from '../lib/api';

const inputCls =
  'h-11 w-full rounded-md border border-forest-200 bg-cream-50 px-3 font-sans text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest-700';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <div className="container-px py-16 lg:py-24">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-center">Account</p>
        <h1 className="mt-3 text-center text-3xl sm:text-4xl">
          {token ? 'Set a new password' : 'Reset your password'}
        </h1>
        {token ? <ResetForm token={token} /> : <RequestForm />}
        <p className="mt-6 text-center font-sans text-xs text-charcoal-muted">
          <Link to="/account" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function RequestForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    try {
      await authService.forgotPassword(email.trim());
    } finally {
      setState('sent');
    }
  };

  if (state === 'sent') {
    return (
      <p className="mt-8 flex items-center gap-2 rounded-md border border-forest-200 bg-forest-50 px-4 py-3 font-sans text-sm text-forest-800">
        <Icon name="check-circle" className="h-4 w-4" />
        If that email is registered, a reset link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className={inputCls}
      />
      <Button as="button" type="submit" fullWidth size="lg" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('saving');
    try {
      await authService.resetPassword(token, password);
      setState('done');
    } catch (err) {
      setState('error');
      setMessage(err instanceof ApiError ? err.message : 'Could not reset your password.');
    }
  };

  if (state === 'done') {
    return (
      <div className="mt-8 text-center">
        <p className="flex items-center justify-center gap-2 font-sans text-sm text-forest-700">
          <Icon name="check-circle" className="h-4 w-4" />
          Your password has been updated.
        </p>
        <Button as="link" to="/account" className="mt-5">
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className={inputCls}
      />
      <p className="font-sans text-[11px] text-charcoal-muted">
        At least 8 characters, with a number and mixed case.
      </p>
      {state === 'error' && <p className="font-sans text-sm text-red-500">{message}</p>}
      <Button as="button" type="submit" fullWidth size="lg" disabled={state === 'saving'}>
        {state === 'saving' ? 'Saving…' : 'Update password'}
      </Button>
    </form>
  );
}
