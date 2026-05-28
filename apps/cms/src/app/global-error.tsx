'use client';

export default function CmsGlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <h1>parksplash CMS unavailable</h1>
          <p>{error.message || 'A fatal error interrupted the CMS.'}</p>
          <button onClick={() => reset()} type="button">Reload</button>
        </main>
      </body>
    </html>
  );
}
