import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server'; // Using renderToString for broader compatibility
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';
import { initializeModelList } from '~/utils/constants';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  await initializeModelList({});

  // Render the application to a string for compatibility
  const appHTML = renderToString(<RemixServer context={remixContext} url={request.url} />);

  // Render the head to a string
  const headHTML = renderHeadToString({ request, remixContext, Head });

  const html = `<!DOCTYPE html>
    <html lang="en" data-theme="${themeStore.value}">
      <head>${headHTML}</head>
      <body>
        <div id="root" class="w-full h-full">${appHTML}</div>
      </body>
    </html>`;

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(html, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
