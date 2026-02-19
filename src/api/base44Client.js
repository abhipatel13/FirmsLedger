import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Base44 API host – SDK uses serverUrl for requests: ${serverUrl}/api/apps/${appId}/entities/...
const apiHost = appBaseUrl || 'https://app.base44.com';

export const base44 = createClient({
  appId: appId || undefined,
  token,
  functionsVersion,
  serverUrl: apiHost,
  requiresAuth: false,
  appBaseUrl: apiHost,
});
