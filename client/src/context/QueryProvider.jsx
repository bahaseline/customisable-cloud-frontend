import { useState } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from './ToastContext';
import { errorMessage } from '../api/errorMessage';

export function QueryProvider({ children }) {
  const { showToast } = useToast();

  const [client] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (err, _vars, _context, mutation) => {
            if (mutation.meta?.silent) return;
            showToast(errorMessage(err));
          },
        }),
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
