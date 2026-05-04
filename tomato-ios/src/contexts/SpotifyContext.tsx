import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  duration: number;
  progress: number;
  progressTs: number;
  isPlaying: boolean;
}

interface SpotifyContextType {
  clientId: string;
  setClientId: (id: string) => void;
  isConnected: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  trackProgress: number; // 0–1
  volume: number;
  login: () => Promise<void>;
  logout: () => void;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (v: number) => Promise<void>;
  playUri: (uri: string) => Promise<void>;
}

// ─── PKCE helpers ──────────────────────────────────────────────────────────────

function randomString(n: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(n);
  // React Native doesn't have crypto.getRandomValues reliably — use Math.random fallback
  for (let i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * chars.length);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

async function pkceChallenge(verifier: string): Promise<string> {
  // Use expo-crypto if available; fallback to plain (S256 optional for Expo Go)
  try {
    const { digestStringAsync, CryptoDigestAlgorithm } = await import('expo-crypto');
    const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, verifier, { encoding: 'base64' as any });
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch {
    // fallback: plain code challenge (less secure, works for dev)
    return verifier;
  }
}

// ─── Storage Keys ──────────────────────────────────────────────────────────────

const K = {
  clientId: 'sp_ios_client_id',
  access: 'sp_ios_access_token',
  refresh: 'sp_ios_refresh_token',
  expiry: 'sp_ios_token_expiry',
  verifier: 'sp_ios_code_verifier',
};

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
].join(' ');

// ─── Context ───────────────────────────────────────────────────────────────────

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientIdState] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const load = async () => {
      const cId = await AsyncStorage.getItem(K.clientId) ?? '';
      const stored = await AsyncStorage.getItem(K.access);
      const expiry = parseInt((await AsyncStorage.getItem(K.expiry)) ?? '0');
      const refresh = await AsyncStorage.getItem(K.refresh);
      setClientIdState(cId);
      if (stored && Date.now() < expiry - 60_000) {
        setAccessToken(stored);
        setIsConnected(true);
      } else if (refresh && cId) {
        await doRefresh(refresh, cId);
      }
    };
    load();
  }, []);

  const setClientId = async (id: string) => {
    await AsyncStorage.setItem(K.clientId, id.trim());
    setClientIdState(id.trim());
  };

  // ─── Token helpers ───────────────────────────────────────────────────────────

  const storeTokens = async (data: { access_token: string; refresh_token?: string; expires_in: number }) => {
    await AsyncStorage.setItem(K.access, data.access_token);
    if (data.refresh_token) await AsyncStorage.setItem(K.refresh, data.refresh_token);
    await AsyncStorage.setItem(K.expiry, (Date.now() + data.expires_in * 1000).toString());
    setAccessToken(data.access_token);
    setIsConnected(true);
  };

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([K.access, K.refresh, K.expiry]);
    setAccessToken(null);
    setIsConnected(false);
    setCurrentTrack(null);
    setIsPlaying(false);
    setTrackProgress(0);
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const doRefresh = useCallback(async (token: string, cId: string) => {
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: token, client_id: cId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      await storeTokens({ ...data, refresh_token: data.refresh_token ?? token });
    } catch {
      await logout();
    }
  }, [logout]);

  // ─── Login (PKCE via expo-auth-session) ─────────────────────────────────────

  const login = async () => {
    if (!clientId) return;
    const verifier = randomString(64);
    const challenge = await pkceChallenge(verifier);
    await AsyncStorage.setItem(K.verifier, verifier);

    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'tomato' });

    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: SCOPES,
        code_challenge_method: challenge === verifier ? 'plain' : 'S256',
        code_challenge: challenge,
      });

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') return;

    const params = new URLSearchParams(result.url.split('?')[1] ?? '');
    const code = params.get('code');
    if (!code) return;

    const storedVerifier = await AsyncStorage.getItem(K.verifier);
    await AsyncStorage.removeItem(K.verifier);

    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: storedVerifier ?? verifier,
        }),
      });
      if (!res.ok) throw new Error();
      await storeTokens(await res.json());
    } catch {
      console.error('Spotify iOS: code exchange failed');
    }
  };

  // ─── API helper ──────────────────────────────────────────────────────────────

  const api = useCallback(async (path: string, method = 'GET', body?: object) => {
    if (!accessToken) return null;
    const res = await fetch(`https://api.spotify.com/v1${path}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      const refresh = await AsyncStorage.getItem(K.refresh);
      if (refresh) doRefresh(refresh, clientId);
    }
    return res;
  }, [accessToken, clientId, doRefresh]);

  // ─── Poll current playback ───────────────────────────────────────────────────

  const fetchPlayback = useCallback(async () => {
    const res = await api('/me/player/currently-playing');
    if (!res || res.status === 204) {
      setCurrentTrack(null);
      setIsPlaying(false);
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    if (!data?.item) return;
    const trk = data.item;
    const playing = data.is_playing;
    setIsPlaying(playing);
    setCurrentTrack({
      id: trk.id,
      name: trk.name,
      artist: trk.artists.map((a: any) => a.name).join(', '),
      albumArt: trk.album.images[0]?.url ?? '',
      duration: trk.duration_ms,
      progress: data.progress_ms,
      progressTs: Date.now(),
      isPlaying: playing,
    });
  }, [api]);

  // Start polling when connected
  useEffect(() => {
    if (!isConnected || !accessToken) return;
    fetchPlayback();
    pollRef.current = setInterval(fetchPlayback, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isConnected, accessToken]);

  // ─── Smooth progress ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - currentTrack.progressTs;
      const pos = Math.min(currentTrack.progress + elapsed, currentTrack.duration);
      setTrackProgress(currentTrack.duration > 0 ? pos / currentTrack.duration : 0);
    }, 300);
    return () => clearInterval(tick);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (!isPlaying && currentTrack) {
      setTrackProgress(currentTrack.progress / (currentTrack.duration || 1));
    }
  }, [isPlaying]);

  // ─── Playback controls ───────────────────────────────────────────────────────

  const togglePlay = async () => {
    if (!accessToken) return;
    await api(isPlaying ? '/me/player/pause' : '/me/player/play', 'PUT');
    setIsPlaying(p => !p);
  };

  const next = async () => {
    await api('/me/player/next', 'POST');
    setTimeout(fetchPlayback, 500);
  };

  const previous = async () => {
    await api('/me/player/previous', 'POST');
    setTimeout(fetchPlayback, 500);
  };

  const setVolume = async (v: number) => {
    setVolumeState(v);
    await api(`/me/player/volume?volume_percent=${Math.round(v * 100)}`, 'PUT');
  };

  const playUri = async (uri: string) => {
    await api('/me/player/play', 'PUT', { context_uri: uri });
    setTimeout(fetchPlayback, 800);
  };

  return (
    <SpotifyContext.Provider value={{
      clientId, setClientId,
      isConnected, isPlaying,
      currentTrack, trackProgress, volume,
      login, logout, togglePlay, next, previous, setVolume, playUri,
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be inside SpotifyProvider');
  return ctx;
};
