'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const initializeClient = async () => {
      if (!isLoaded || !user) return;
      if (!API_KEY) {
        console.error('Stream API key is missing');
        return;
      }

      try {
        const client = new StreamVideoClient({
          apiKey: API_KEY,
          user: {
            id: user?.id,
            name: user?.username || user?.id,
            image: user?.imageUrl,
          },
          tokenProvider: await tokenProvider(), // Ensure the token provider is async if needed
        });

        setVideoClient(client);
      } catch (error) {
        console.error('Error initializing StreamVideoClient:', error);
        // Handle the error (e.g., show a user-friendly message)
      }
    };

    initializeClient();
  }, [user, isLoaded]);

  if (!videoClient) return <Loader message="Connecting to video service..." />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
