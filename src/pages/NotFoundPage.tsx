import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="container-px py-28 text-center lg:py-40">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">This page has wandered off</h1>
      <p className="mx-auto mt-4 max-w-md font-sans text-base text-charcoal-light">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get
        you back to something nourishing.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button as="link" to="/" size="lg">
          Back to Home
        </Button>
        <Button as="link" to="/shop" size="lg" variant="secondary">
          Shop Hair Oil
        </Button>
      </div>
    </div>
  );
}
