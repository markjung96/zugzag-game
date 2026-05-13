// Shared primitives + data for zugzag-game
const HOLD_COLORS = {
  white:  { hex: '#F8F9FA', text: '#0A0A0B', kr: '흰' },
  yellow: { hex: '#FBBF24', text: '#0A0A0B', kr: '노랑' },
  orange: { hex: '#FB923C', text: '#0A0A0B', kr: '주황' },
  green:  { hex: '#22C55E', text: '#FFFFFF', kr: '초록' },
  blue:   { hex: '#3B82F6', text: '#FFFFFF', kr: '파랑' },
  red:    { hex: '#EF4444', text: '#FFFFFF', kr: '빨강' },
  purple: { hex: '#A855F7', text: '#FFFFFF', kr: '보라' },
  black:  { hex: '#1F2937', text: '#F8F9FA', kr: '검정' },
};

const SCORE_BY_COLOR = {
  white: 10, yellow: 20, orange: 35, green: 60, blue: 95, red: 140, purple: 195, black: 260,
};

const CREW_NAME = '서울볼더스';
const SEASON_NAME = '2026 5월 랭크전';

// ----- Avatar -----
function Avatar({ name, size = 40, color = '#FF3B5C', src }) {
  const init = (name || '?').slice(0, 1);
  const fontSize = Math.round(size * 0.42);
  return (
    <div
      className="zz-avatar"
      style={{
        width: size,
        height: size,
        fontSize,
        background: src ? '#000' : color,
        color: '#0A0A0B',
        fontWeight: 800,
      }}
    >
      {init}
    </div>
  );
}

// ----- Session Kind Badge -----
function KindBadge({ kind = 'ranked' }) {
  return <span className={`kind-pill ${kind}`}>{kind === 'ranked' ? 'RANKED' : 'CASUAL'}</span>;
}

// ----- Hold Chip -----
function HoldChip({ color, number, size = 60, done = false, attempted = false, onClick }) {
  const c = HOLD_COLORS[color];
  return (
    <button
      onClick={onClick}
      data-color={color}
      className="hold-chip"
      style={{
        width: size, height: size,
        background: c.hex,
        color: c.text,
        fontSize: Math.round(size * 0.4),
        opacity: done ? 0.55 : 1,
        border: attempted && !done ? `2px dashed ${c.text === '#FFFFFF' ? '#fff' : '#0A0A0B'}` : 'none',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {number}
      {done && (
        <span style={{
          position: 'absolute', top: 4, right: 4, width: 16, height: 16,
          background: '#0A0A0B', color: '#22C55E', borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
        }}>✓</span>
      )}
    </button>
  );
}

// ----- FAB -----
function FAB({ label = '기록', onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', right: 16, bottom: 88, zIndex: 200,
        background: 'var(--accent-ranked)', color: '#fff',
        border: 'none', borderRadius: 9999,
        padding: '14px 20px',
        fontFamily: 'var(--font-kr)', fontWeight: 700, fontSize: 15,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 24px rgba(255,59,92,0.45), 0 1px 2px rgba(0,0,0,0.6)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 0, fontWeight: 300 }}>＋</span>
      <span>{label}</span>
    </button>
  );
}

// ----- Toast -----
function Toast({ children, kind = 'send' }) {
  const bg = kind === 'send' ? 'var(--bg-surface-2)' : 'var(--bg-surface-2)';
  return (
    <div
      className="zz-slidein"
      style={{
        background: bg, color: 'var(--text-primary)',
        borderRadius: 'var(--r-lg)', padding: '12px 14px',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--el-toast)',
        display: 'flex', alignItems: 'center', gap: 12,
        minWidth: 260,
      }}
    >
      {children}
    </div>
  );
}

// ----- Bottom Nav (PWA tab bar) -----
function BottomNav({ active = 'home', rankedLive = false }) {
  const tabs = [
    { id: 'home', label: '홈', icon: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
    { id: 'board', label: '보드', icon: 'M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z' },
    { id: 'live', label: '라이브', icon: 'M5 5h14v10H5zM9 19h6M12 15v4' },
    { id: 'me', label: '내 기록', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 1 1 16 0' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-default)',
      display: 'flex', alignItems: 'flex-start', paddingTop: 8,
      zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} style={{
          flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: active === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
          padding: '6px 0',
          position: 'relative',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.icon} />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
          {t.id === 'live' && rankedLive && (
            <span style={{ position: 'absolute', top: 6, right: '32%', width: 8, height: 8, borderRadius: 9999, background: 'var(--accent-ranked)', boxShadow: '0 0 12px var(--accent-ranked)' }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ----- Phone status bar -----
function StatusBar({ time = '14:32' }) {
  return (
    <div className="zz-phone-statusbar">
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M0 9h2v2H0zm4-2h2v4H4zm4-3h2v7H8zm4-3h2v10h-2z"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1"><path d="M1 5a8 8 0 0 1 12 0M3 7a5 5 0 0 1 8 0"/><circle cx="7" cy="9" r="0.8" fill="currentColor" stroke="none"/></svg>
        <span style={{ fontSize: 12 }}>89%</span>
      </div>
    </div>
  );
}

// ----- Phone shell wrapper -----
function Phone({ children, time = '14:32', noStatus = false }) {
  return (
    <div className="zz-phone">
      <div className="zz-phone-notch" />
      {!noStatus && <StatusBar time={time} />}
      <div style={{ position: 'absolute', inset: 0, paddingTop: noStatus ? 0 : 44 }}>
        {children}
      </div>
      <div className="zz-phone-home" />
    </div>
  );
}

// ----- Mock leaderboard data -----
const LEADERS = [
  { rank: 1, name: '윤소이', initial: '윤', color: '#FF3B5C', score: 1820, sends: 14, last: 'red' },
  { rank: 2, name: '강민혁', initial: '강', color: '#FB923C', score: 1335, sends: 11, last: 'blue' },
  { rank: 3, name: '한지우', initial: '한', color: '#22C55E', score: 1240, sends: 9,  last: 'red' },
  { rank: 4, name: '오세훈', initial: '오', color: '#3B82F6', score: 1085, sends: 9,  last: 'blue' },
  { rank: 5, name: '문가람', initial: '문', color: '#A855F7', score: 985,  sends: 8,  last: 'green' },
  { rank: 6, name: '백수아', initial: '백', color: '#FBBF24', score: 870,  sends: 7,  last: 'green' },
  { rank: 7, name: '정해린', initial: '정', color: '#22C55E', score: 760,  sends: 6,  last: 'yellow' },
  { rank: 8, name: '서도현', initial: '서', color: '#FF3B5C', score: 655,  sends: 6,  last: 'blue' },
  { rank: 9, name: '임채영', initial: '임', color: '#3B82F6', score: 540,  sends: 5,  last: 'orange' },
  { rank: 10,name: '노지환', initial: '노', color: '#FB923C', score: 480,  sends: 5,  last: 'yellow' },
];

const ACTIVITY_FEED = [
  { name: '한지우', initial: '한', color: '#22C55E', wall: 'B벽', color2: 'red', number: 7,  score: 140, ago: '방금', kind: 'ranked' },
  { name: '강민혁', initial: '강', color: '#FB923C', wall: 'A벽', color2: 'blue', number: 12, score: 95,  ago: '12초 전', kind: 'ranked' },
  { name: '윤소이', initial: '윤', color: '#FF3B5C', wall: 'C벽', color2: 'red', number: 3,  score: 140, ago: '38초 전', kind: 'ranked' },
  { name: '오세훈', initial: '오', color: '#3B82F6', wall: 'B벽', color2: 'blue', number: 9,  score: 95,  ago: '1분 전', kind: 'ranked' },
  { name: '문가람', initial: '문', color: '#A855F7', wall: 'A벽', color2: 'green', number: 14,score: 60,  ago: '2분 전', kind: 'ranked' },
  { name: '백수아', initial: '백', color: '#FBBF24', wall: 'D벽', color2: 'orange', number: 5,score: 35,  ago: '3분 전', kind: 'ranked' },
];

// Export to window
Object.assign(window, {
  HOLD_COLORS, SCORE_BY_COLOR, CREW_NAME, SEASON_NAME,
  Avatar, KindBadge, HoldChip, FAB, Toast, BottomNav, StatusBar, Phone,
  LEADERS, ACTIVITY_FEED,
});
