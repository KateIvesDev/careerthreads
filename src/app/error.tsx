"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="record-shell error-shell">
      <p className="eyebrow">Career Record unavailable</p>
      <h1>We couldn&apos;t load your record.</h1>
      <p>Your career data has not been changed. Try loading it again.</p>
      <button className="primary-action" onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}
