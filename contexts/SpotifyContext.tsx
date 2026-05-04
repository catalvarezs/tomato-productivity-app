import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  duration: number;  // ms
  progress: number;  // ms at last event
  progressTs: number; // Date.now() when progress was captured
}

interface SpotifyContextType {
  clientId: string;
  setClientId: (id: string) => void;
  isConnected: boolean;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  trackProgress: number; // 0–1, smoothly updated
  volume: number;
  login: () => void;
  logout: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (v: number) => void;
  playUri: (uri: string) => Promise<void>;
}

// ─── PKCE helpers ──────────────────────────────────────────────────────────────

function randomString(n: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map(b => chars[b % chars.length]).join('');
}

async function pkceChallenge(verifier: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const K = {
  clientId: 'sp_client_id',
  access: 'sp_access_token',
  refresh: 'sp_refresh_token',
  expiry: 'sp_token_expiry',
  verifier: 'sp_code_verifier',
};

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ');

// ─── Context ───────────────────────────────────────────────────────────────────

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export const SpotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientIdState] = useState(() => localStorage.getItem(K.clientId) ?? '');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  const redirectUri = () =>
    window.location.origin + window.location.pathname.replace(/\/$/, '');

  // ─── Persist client ID ───────────────────────────────────────────────────────

  const setClientId = (id: string) => {
    localStorage.setItem(K.clientId, id.trim());
    setClientIdState(id.trim());
  };

  // ─── Token helpers ───────────────────────────────────────────────────────────

  const storeTokens = (data: { access_token: string; refresh_token?: string; expires_in: number }) => {
    localStorage.setItem(K.access, data.access_token);
    if (data.refresh_token) localStorage.setItem(K.refresh, data.refresh_token);
    localStorage.setItem(K.expiry, (Date.now() + data.expires_in * 1000).toString());
    setAccessToken(data.access_token);
    setIsConnected(true);
  };

  const logout = useCallback(() => {
    [K.access, K.refresh, K.expiry].forEach(k => localStorage.removeItem(k));
    setAccessToken(null);
    setIsConnected(false);
    setIsReady(false);
    setCurrentTrack(null);
    setIsPlaying(false);
    setTrackProgress(0);
    playerRef.current?.disconnect();
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
      storeTokens({ ...data, refresh_token: data.refresh_token ?? token });
    } catch {
      logout();
    }
  }, [logout]);

  const exchangeCode = useCallback(async (code: string, cId: string) => {
    const verifier = sessionStorage.getItem(K.verifier);
    if (!verifier || !cId) return;
    sessionStorage.removeItem(K.verifier);
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: cId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri(),
          code_verifier: verifier,
        }),
      });
      if (!res.ok) throw new Error();
      storeTokens(await res.json());
    } catch {
      console.error('Spotify: code exchange failed');
    }
  }, []);

  // ─── Boot: handle callback or restore session ────────────────────────────────

  useEffect(() => {
    const cId = localStorage.getItem(K.clientId) ?? '';
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      exchangeCode(code, cId);
      return;
    }
    const stored = localStorage.getItem(K.access);
    const expiry = parseInt(localStorage.getItem(K.expiry) ?? '0');
    const refresh = localStorage.getItem(K.refresh);
    if (stored && Date.now() < expiry - 60_000) {
      setAccessToken(stored);
      setIsConnected(true);
    } else if (refresh && cId) {
      doRefresh(refresh, cId);
    }
  }, []);

  // ─── Initialise Web Playback SDK ─────────────────────────────────────────────

  useEffect(() => {
    if (!accessToken) return;

    const init = () => {
      playerRef.current?.disconnect();
      const player = new (window as any).Spotify.Player({
        name: 'Tomato Focus Timer',
        getOAuthToken: (cb: (t: string) => void) => cb(accessToken),
        volume,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener('not_ready', () => setIsReady(false));

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        const trk = state.track_window.current_track;
        setIsPlaying(!state.paused);
        setCurrentTrack({
          id: trk.id,
          name: trk.name,
          artist: trk.artists.map((a: any) => a.name).join(', '),
          albumArt: trk.album.images[0]?.url ?? '',
          duration: state.duration,
          progress: state.position,
          progressTs: Date.now(),
        });
      });

      player.connect();
      playerRef.current = player;
    };

    if ((window as any).Spotify) init();
    else (window as any).onSpotifyWebPlaybackSDKReady = init;

    return () => { playerRef.current?.disconnect(); };
  }, [accessToken]);

  // ─── Smooth progress ticker ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - currentTrack.progressTs;
      const pos = Math.min(currentTrack.progress + elapsed, currentTrack.duration);
      setTrackProgress(currentTrack.duration > 0 ? pos / currentTrack.duration : 0);
    }, 300);
    return () => clearInterval(tick);
  }, [isPlaying, currentTrack]);

  // Reset progress when paused
  useEffect(() => {
    if (!isPlaying && currentTrack) {
      setTrackProgress(currentTrack.progress / (currentTrack.duration || 1));
    }
  }, [isPlaying]);

  // ─── API helper ──────────────────────────────────────────────────────────────

  const api = useCallback(async (path: string, method = 'GET', body?: object) => {
    if (!accessToken) return;
    const res = await fetch(`https://api.spotify.com/v1${path}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      const refresh = localStorage.getItem(K.refresh);
      if (refresh) doRefresh(refresh, clientId);
    }
    return res;
  }, [accessToken, clientId, doRefresh]);

  // ─── Login ───────────────────────────────────────────────────────────────────

  const login = async () => {
    if (!clientId) return;
    const verifier = randomString(64);
    const challenge = await pkceChallenge(verifier);
    sessionStorage.setItem(K.verifier, verifier);
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri(),
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  };

  // ─── Playback controls ───────────────────────────────────────────────────────

  const togglePlay = () => playerRef.current?.togglePlay();
  const next = () => playerRef.current?.nextTrack();
  const previous = () => playerRef.current?.previousTrack();

  const setVolume = (v: number) => {
    setVolumeState(v);
    playerRef.current?.setVolume(v);
  };

  const playUri = async (uri: string) => {
    if (!deviceId) return;
    await api(`/me/player/play?device_id=${deviceId}`, 'PUT', { context_uri: uri });
  };

  return (
    <SpotifyContext.Provider value={{
      clientId, setClientId,
      isConnected, isReady, isPlaying,
      currentTrack, trackProgress, volume,
      login, logout, togglePlay, next, previous, setVolume, playUri,
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be used inside SpotifyProvider');
  return ctx;
};
