'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getIntercomSettings } from '@/lib/intercom';

declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
  }
}

export function IntercomWidget() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    // Load Intercom script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}`;
    document.body.appendChild(script);

    // Initialize Intercom
    window.intercomSettings = getIntercomSettings(
      user ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || undefined,
        createdAt: new Date(user.createdAt),
        // Add any custom attributes
        plan: 'free', // Example: get from user metadata
        company: user.publicMetadata?.company as string,
      } : undefined
    );

    if (window.Intercom) {
      window.Intercom('reattach_activator');
      window.Intercom('update', window.intercomSettings);
    }

    // Cleanup
    return () => {
      if (window.Intercom) {
        window.Intercom('shutdown');
      }
      document.body.removeChild(script);
    };
  }, [user, isLoaded]);

  return null;
}

// Hook for programmatic Intercom usage
export function useIntercom() {
  const show = () => {
    if (window.Intercom) {
      window.Intercom('show');
    }
  };

  const hide = () => {
    if (window.Intercom) {
      window.Intercom('hide');
    }
  };

  const showMessages = () => {
    if (window.Intercom) {
      window.Intercom('showMessages');
    }
  };

  const showNewMessage = (message?: string) => {
    if (window.Intercom) {
      window.Intercom('showNewMessage', message);
    }
  };

  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    if (window.Intercom) {
      window.Intercom('trackEvent', eventName, metadata);
    }
  };

  const update = (attributes?: Record<string, any>) => {
    if (window.Intercom) {
      window.Intercom('update', attributes);
    }
  };

  return {
    show,
    hide,
    showMessages,
    showNewMessage,
    trackEvent,
    update,
  };
}