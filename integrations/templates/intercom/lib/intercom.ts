// Server-side Intercom client
export const intercomConfig = {
  appId: process.env.NEXT_PUBLIC_INTERCOM_APP_ID!,
  accessToken: process.env.INTERCOM_ACCESS_TOKEN,
};

// Initialize Intercom for a user
export function getIntercomSettings(user?: {
  id: string;
  email?: string;
  name?: string;
  createdAt?: Date;
  [key: string]: any;
}) {
  const settings: any = {
    app_id: intercomConfig.appId,
  };

  if (user) {
    settings.user_id = user.id;
    settings.email = user.email;
    settings.name = user.name;
    settings.created_at = user.createdAt 
      ? Math.floor(user.createdAt.getTime() / 1000) 
      : undefined;
    
    // Add custom attributes
    Object.entries(user).forEach(([key, value]) => {
      if (!['id', 'email', 'name', 'createdAt'].includes(key)) {
        settings[key] = value;
      }
    });
  }

  return settings;
}

// Track events (server-side)
export async function trackEvent(
  userId: string,
  eventName: string,
  metadata?: Record<string, any>
) {
  if (!intercomConfig.accessToken) {
    console.warn('Intercom access token not configured');
    return { success: false, error: 'Access token not configured' };
  }

  try {
    const response = await fetch('https://api.intercom.io/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intercomConfig.accessToken}`,
        'Content-Type': 'application/json',
        'Intercom-Version': '2.10',
      },
      body: JSON.stringify({
        event_name: eventName,
        user_id: userId,
        created_at: Math.floor(Date.now() / 1000),
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Intercom tracking error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event',
    };
  }
}

// Update user attributes
export async function updateUser(
  userId: string,
  attributes: Record<string, any>
) {
  if (!intercomConfig.accessToken) {
    console.warn('Intercom access token not configured');
    return { success: false, error: 'Access token not configured' };
  }

  try {
    const response = await fetch('https://api.intercom.io/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intercomConfig.accessToken}`,
        'Content-Type': 'application/json',
        'Intercom-Version': '2.10',
      },
      body: JSON.stringify({
        user_id: userId,
        ...attributes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Intercom user update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

// Create or update a lead
export async function createLead(lead: {
  email: string;
  name?: string;
  phone?: string;
  [key: string]: any;
}) {
  if (!intercomConfig.accessToken) {
    console.warn('Intercom access token not configured');
    return { success: false, error: 'Access token not configured' };
  }

  try {
    const response = await fetch('https://api.intercom.io/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intercomConfig.accessToken}`,
        'Content-Type': 'application/json',
        'Intercom-Version': '2.10',
      },
      body: JSON.stringify({
        role: 'lead',
        ...lead,
      }),
    });

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Intercom lead creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create lead',
    };
  }
}

// Send a message from the app
export async function sendMessage(
  userId: string,
  message: string,
  type: 'email' | 'in_app' = 'in_app'
) {
  if (!intercomConfig.accessToken) {
    console.warn('Intercom access token not configured');
    return { success: false, error: 'Access token not configured' };
  }

  try {
    const response = await fetch('https://api.intercom.io/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intercomConfig.accessToken}`,
        'Content-Type': 'application/json',
        'Intercom-Version': '2.10',
      },
      body: JSON.stringify({
        message_type: type,
        subject: type === 'email' ? 'Message from your app' : undefined,
        body: message,
        template: 'plain',
        from: {
          type: 'admin',
          id: process.env.INTERCOM_ADMIN_ID,
        },
        to: {
          type: 'user',
          user_id: userId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Intercom message error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}