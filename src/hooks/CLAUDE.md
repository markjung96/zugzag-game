# src/hooks/ — 커스텀 React Hooks

## 네이밍

- `use{Domain}{Action}` 패턴 (예: `useLiveBoard`, `useRealtimeSends`).

## Realtime 구독

- Supabase Realtime 구독 hook은 `useRealtime{Table}` 패턴.
- cleanup은 반드시 `useEffect` return에서 `channel.unsubscribe()`.
- Publication 허용 테이블만 구독: sends, send_revisions, sessions, seasons.
