import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createDemoAppService } from '../application/demoAppService';
import type { AppService } from '../domain/contracts';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';

interface AppServiceContextValue {
  service: AppService;
  retry: () => void;
  resetDemoData: () => Promise<void>;
}

interface AppServiceProviderProps {
  children: ReactNode;
  service?: AppService;
}

type InitializationState =
  | { status: 'loading'; error: null }
  | { status: 'ready'; error: null }
  | { status: 'error'; error: Error };

const AppServiceContext = createContext<AppServiceContextValue | null>(null);
const initializationByService = new WeakMap<AppService, Promise<void>>();
let defaultService: AppService | null = null;

function getDefaultService() {
  if (!defaultService) defaultService = createDemoAppService();
  return defaultService;
}

function initialize(service: AppService, force = false) {
  if (force) initializationByService.delete(service);
  const existing = initializationByService.get(service);
  if (existing) return existing;

  const attempt = service.initialize();
  initializationByService.set(service, attempt);
  return attempt;
}

export function AppServiceProvider({ children, service: suppliedService }: AppServiceProviderProps) {
  const service = useMemo(() => suppliedService ?? getDefaultService(), [suppliedService]);
  const [state, setState] = useState<InitializationState>({ status: 'loading', error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setState({ status: 'loading', error: null });
    void initialize(service, attempt > 0)
      .then(() => {
        if (current) setState({ status: 'ready', error: null });
      })
      .catch((error: unknown) => {
        if (current) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error('Local persistence unavailable'),
          });
        }
      });

    return () => {
      current = false;
    };
  }, [attempt, service]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const resetDemoData = useCallback(async () => {
    await service.resetDemoData();
  }, [service]);

  const value = useMemo(
    () => ({ service, retry, resetDemoData }),
    [resetDemoData, retry, service],
  );

  if (state.status === 'loading') {
    return (
      <main className="workspace-startup">
        <LoadingState label="Opening local workspace" />
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="app-failure" role="alert">
        <p className="eyebrow">Local workspace unavailable</p>
        <h1>Your local workspace could not be opened.</h1>
        <p>
          Retry without clearing anything. No reset, external action, email, or post was attempted.
        </p>
        <Button onClick={retry}>Retry local workspace</Button>
      </main>
    );
  }

  return <AppServiceContext.Provider value={value}>{children}</AppServiceContext.Provider>;
}

export function useAppService() {
  const context = useContext(AppServiceContext);
  if (!context) throw new Error('useAppService must be used within AppServiceProvider.');
  return context;
}
