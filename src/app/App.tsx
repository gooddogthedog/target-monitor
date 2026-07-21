import { BrowserRouter } from 'react-router-dom';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppServiceProvider } from './AppServiceProvider';
import { AppRoutes } from './routes';

export function App() {
  return (
    <AppErrorBoundary>
      <AppServiceProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppServiceProvider>
    </AppErrorBoundary>
  );
}
