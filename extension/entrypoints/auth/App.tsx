import './auth.css';
import { useState, useEffect } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
const supabaseUrl = 'https://nzbrkhngkszrdmahshpp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YnJraG5na3N6cmRtYWhzaHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzI4OTgsImV4cCI6MjA1NzMwODg5OH0.LyLKnMwTQLiB-z_1MuTwmdX0kiLbpsIUL3tqMzDK0Ow';
const supabase = createClient(supabaseUrl, supabaseKey);

const queryParams = {
  access_type: 'offline',
  prompt: 'consent',
};

export function App() {
  // Get tab URL from the chrome object
  const tabUrl = new URL(window.location.href);
  const type = tabUrl.searchParams.get('type');
  const access_token = tabUrl.searchParams.get('access_token');
  const refresh_token = tabUrl.searchParams.get('refresh_token');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            chrome.runtime.sendMessage({ type: 'SET_AUTH', auth: session });
            chrome.storage.local.set({ auth: session });
          }
        });
    } else {
      // Manually check for a session in case onAuthStateChange didn't trigger it.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          chrome.runtime.sendMessage({ type: 'SET_AUTH', session });
          chrome.storage.local.set({ auth: session });
        }
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (session) {
        chrome.runtime.sendMessage({ type: 'SET_AUTH', auth: session });
        if (event === 'USER_UPDATED') {
          window.location.assign(`${tabUrl.origin}${tabUrl.pathname}`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1>Login</h1>
          <Auth
            supabaseClient={supabase}
            view={type === 'recovery' ? 'update_password' : undefined}
            providers={['google']}
            queryParams={queryParams}
            redirectTo={chrome.identity.getRedirectURL()}
            appearance={{ theme: ThemeSupa }}
          />
        </div>
      </div>
    );
  } else {
    console.log(`Auth html`);
    console.log(session);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Successfully logged in</h1>
          <p className="text-gray-600">You can now close this tab.</p>
        </div>
      </div>
    );
  }
}
