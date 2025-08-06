'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Channel } from 'pusher-js';
import { getPusherClient } from '@/lib/pusher-client';

export function usePusher() {
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef(getPusherClient());

  useEffect(() => {
    const pusher = pusherRef.current;

    pusher.connection.bind('connected', () => {
      setIsConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    return () => {
      pusher.connection.unbind('connected');
      pusher.connection.unbind('disconnected');
    };
  }, []);

  return {
    pusher: pusherRef.current,
    isConnected,
  };
}

export function useChannel(channelName: string) {
  const { pusher, isConnected } = usePusher();
  const [channel, setChannel] = useState<Channel | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelName || !isConnected) return;

    const newChannel = pusher.subscribe(channelName);
    channelRef.current = newChannel;
    setChannel(newChannel);

    return () => {
      if (channelRef.current) {
        pusher.unsubscribe(channelName);
        channelRef.current = null;
      }
    };
  }, [channelName, pusher, isConnected]);

  return channel;
}

export function useEvent<T = any>(
  channel: Channel | null,
  eventName: string,
  callback: (data: T) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!channel || !eventName) return;

    const handler = (data: T) => {
      callbackRef.current(data);
    };

    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channel, eventName]);
}

// Combined hook for easy usage
export function usePusherEvent<T = any>(
  channelName: string,
  eventName: string,
  callback: (data: T) => void
) {
  const channel = useChannel(channelName);
  useEvent(channel, eventName, callback);
  
  return channel;
}

// Presence channel hook
export function usePresenceChannel(channelName: string) {
  const { pusher, isConnected } = usePusher();
  const [members, setMembers] = useState<any[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!channelName || !isConnected || !channelName.startsWith('presence-')) {
      return;
    }

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setMembers(Object.values(members.members));
      setMyId(members.myID);
    });

    channel.bind('pusher:member_added', (member: any) => {
      setMembers(prev => [...prev, member]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setMembers(prev => prev.filter(m => m.id !== member.id));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [channelName, pusher, isConnected]);

  return {
    channel: channelRef.current,
    members,
    myId,
    count: members.length,
  };
}