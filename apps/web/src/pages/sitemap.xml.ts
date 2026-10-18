import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const paths = ['', '/height-predictor', '/method', '/pricing', '/privacy', '/terms', '/health-disclaimer', '/support'];
  const entries = paths.map((path) => `<url><loc>https://tallsoon.pro${path}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
