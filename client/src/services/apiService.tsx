// src/services/apiService.tsx
import { getAuth, getIdToken, signOut } from 'firebase/auth';

export async function secureApiCall(endpoint: string, method: string, body?: object | FormData): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const idToken = await getIdToken(user);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${idToken}`,
  };

  let fetchBody: string | FormData | undefined;
  if (body instanceof FormData) {
    fetchBody = body; // FormData is passed as-is, no Content-Type header needed
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const response = await fetch(endpoint, {
    method,
    headers,
    body: fetchBody,
  });

  if (response.ok) {
    return response;
  } else if (response.status === 403) {
    await signOut(auth);
    window.dispatchEvent(new CustomEvent('session-expired'));
    throw new Error('Session expired. Please log in again.');
  } else {
    const errorText = await response.text();
    console.error('API call failed:', response.status, errorText);
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }
}