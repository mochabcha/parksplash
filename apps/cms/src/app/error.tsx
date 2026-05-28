'use client';

export default function CmsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <h1>parksplash CMS error</h1>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => reset()} type="button">Try again</button>
        </main>
      </body>
    </html>
  );
}
