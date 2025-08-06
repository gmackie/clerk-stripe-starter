import Pusher from 'pusher';

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default pusherServer;

// Trigger an event to a channel
export async function triggerEvent(
  channel: string,
  event: string,
  data: any
) {
  try {
    await pusherServer.trigger(channel, event, data);
    return { success: true };
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger event',
    };
  }
}

// Trigger an event to multiple channels
export async function triggerBatch(
  channels: string[],
  event: string,
  data: any
) {
  try {
    await pusherServer.trigger(channels, event, data);
    return { success: true };
  } catch (error) {
    console.error('Pusher batch trigger error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger batch event',
    };
  }
}

// Authenticate private channel subscriptions
export function authenticateChannel(
  socketId: string,
  channel: string,
  userId?: string
) {
  if (channel.startsWith('presence-') && userId) {
    const presenceData = {
      user_id: userId,
      user_info: {
        // Add any additional user info you want to share
        id: userId,
      },
    };
    return pusherServer.authorizeChannel(socketId, channel, presenceData);
  }
  
  return pusherServer.authorizeChannel(socketId, channel);
}

// Get channel information
export async function getChannelInfo(channel: string) {
  try {
    const response = await pusherServer.get({
      path: `/channels/${channel}`,
    });
    return {
      success: true,
      data: await response.json(),
    };
  } catch (error) {
    console.error('Pusher channel info error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get channel info',
    };
  }
}

// Get list of all active channels
export async function getChannels() {
  try {
    const response = await pusherServer.get({
      path: '/channels',
    });
    return {
      success: true,
      data: await response.json(),
    };
  } catch (error) {
    console.error('Pusher channels list error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get channels',
    };
  }
}