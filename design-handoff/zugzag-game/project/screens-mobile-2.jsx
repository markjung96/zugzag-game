// P4 SeasonDetailPage + P5 GameHome — mobile

function Sparkline({ data, width = 120, height = 32, color = 'var(--accent-ranked)' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * stepX} cy={height - ((data[data.length-1] - min) / range) * height} r="2.5" fill={color} />
    </svg>
  );
}

const GROWTH_DATA = [120, 180, 240, 310, 410, 480, 590, 680, 760, 820, 950, 1080, 1180, 1240];

function MedalRing({ rank }) {
  const colors = {
    1: { from: '#FFD24A', to: '#F59E0B' },
    2: { from: '#E5E7EB', to: '#9CA3AF' },
    3: { from: '#CD7F32', to: '#92400E' },
  };
  const c = colors[rank];
  if (!c) return <span className="zz-num" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{rank}</span>;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 9999,
      background: `conic-gradient(from 180deg, ${c.from}, ${c.to}, ${c.from})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="zz-num" style={{ color: '#0A0A0B', fontWeight: 800, fontSize: 16 }}>{rank}</span>
    </div>
  );
}

function SeasonDetailMobile() {
  return (
    <div className="zz-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', flexShrink: 0, borderBottom: '1px solid var(--border-default)' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 9999, background: 'rgba(34,197,94,0.12)', color: 'var(--accent-success)', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE · D-18</span>
            </div>
            <h1 className="t-title-xl">{SEASON_NAME}</h1>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>2026.05.01 — 2026.05.31</div>
          </div>
        </div>

        {/* My strip */}
        <div style={{
          marginTop: 16, padding: 16, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,59,92,0.06), transparent)',
          border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>내 순위</div>
            <div className="t-title-lg" style={{ marginTop: 2, fontFamily: 'var(--font-num)' }}>
              2<span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 4 }}>위</span>
              <span style={{ marginLeft: 12, color: 'var(--accent-ranked)' }}>1,335</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 8, fontWeight: 400 }}>14완등</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Sparkline data={GROWTH_DATA} width={100} height={36} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', padding: '0 20px', flexShrink: 0 }}>
        <button style={{
          padding: '14px 0 12px', marginRight: 24, background: 'transparent', border: 'none',
          color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          borderBottom: '2px solid var(--accent-ranked)',
        }}>개인</button>
        <button style={{
          padding: '14px 0 12px', background: 'transparent', border: 'none',
          color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>팀</button>
      </div>

      {/* List */}
      <div className="zz-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 200px' }}>
        {LEADERS.map(l => (
          <div key={l.rank} style={{
            padding: '12px 4px', display: 'grid',
            gridTemplateColumns: '40px 1fr auto auto', gap: 12,
            alignItems: 'center',
            borderBottom: '1px solid var(--border-default)',
            background: l.rank === 2 ? 'rgba(255,59,92,0.04)' : 'transparent',
            borderRadius: l.rank === 2 ? 12 : 0,
            marginLeft: l.rank === 2 ? -4 : 0, marginRight: l.rank === 2 ? -4 : 0,
            paddingLeft: l.rank === 2 ? 8 : 4, paddingRight: l.rank === 2 ? 8 : 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MedalRing rank={l.rank} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <Avatar name={l.initial} color={l.color} size={36} />
              <div style={{ minWidth: 0 }}>
                <div className="t-body-lg" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.name} {l.rank === 2 && <span style={{ fontSize: 11, color: 'var(--accent-ranked)', marginLeft: 6, fontWeight: 700 }}>나</span>}
                </div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>{l.sends}완등</div>
              </div>
            </div>
            <div style={{ width: 12, height: 12, borderRadius: 9999, background: HOLD_COLORS[l.last].hex }} />
            <div className="zz-num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', minWidth: 60, textAlign: 'right' }}>
              {l.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="me" rankedLive />
    </div>
  );
}

// ----- P5 GameHomePage — state machine -----
const HOME_STATES = [
  { id: 'live_joined', label: '라이브 진행 중 · 참가함' },
  { id: 'live_not_joined', label: '라이브 진행 중 · 미참가' },
  { id: 'leader_idle', label: '리더 · 시즌 진행' },
  { id: 'member_idle', label: '멤버 · 시즌 진행' },
  { id: 'empty_member', label: '멤버 · 첫 풀이 0' },
  { id: 'no_season_leader', label: '리더 · 시즌 없음' },
  { id: 'loading', label: '로딩 중' },
];

function HomeHero_LiveNotJoined() {
  return (
    <div style={{
      padding: 24, borderRadius: 20,
      background: 'linear-gradient(135deg, rgba(255,59,92,0.16), rgba(255,59,92,0.02))',
      border: '1px solid var(--accent-ranked)',
      position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--el-glow-ranked)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--accent-ranked)' }} className="zz-pulse" />
        <span style={{ fontSize: 11, color: 'var(--accent-ranked)', fontWeight: 700, letterSpacing: '0.1em' }}>LIVE RANKED</span>
      </div>
      <div className="t-title-lg">토요 현장 랭크전</div>
      <div className="zz-num" style={{ fontSize: 48, fontWeight: 800, marginTop: 12, lineHeight: 1, letterSpacing: '-0.02em' }}>
        04:38
      </div>
      <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>14명 참가 중 · 종료까지</div>
      <button className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ marginTop: 16 }}>지금 참가하기</button>
    </div>
  );
}

function HomeHero_LiveJoined() {
  return (
    <div style={{
      padding: 24, borderRadius: 20,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--accent-ranked)' }} className="zz-pulse" />
        <span style={{ fontSize: 11, color: 'var(--accent-ranked)', fontWeight: 700, letterSpacing: '0.1em' }}>LIVE · 04:38 남음</span>
      </div>
      <div className="t-body-md" style={{ color: 'var(--text-secondary)' }}>이번 세션 내 순위</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <span className="zz-num" style={{ fontSize: 56, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>2</span>
        <span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>위 · </span>
        <span className="zz-num" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-ranked)' }}>+285점</span>
      </div>
      <button className="zz-btn zz-btn-secondary zz-btn-full" style={{ marginTop: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5h14v10H5zM9 19h6M12 15v4"/></svg>
        라이브 보드 보기
      </button>
    </div>
  );
}

function HomeHero_LeaderIdle() {
  return (
    <div style={{
      padding: 24, borderRadius: 20,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    }}>
      <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600 }}>현재 시즌</div>
      <div className="t-title-lg" style={{ marginTop: 4 }}>{SEASON_NAME}</div>
      <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>14명 참가 · D-18</div>
      <button className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ marginTop: 20 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>
        즉석 랭크전 열기
      </button>
      <button className="zz-btn zz-btn-ghost zz-btn-full" style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
        다음 세션 예약하기
      </button>
    </div>
  );
}

function HomeHero_MemberIdle() {
  return (
    <div style={{
      padding: 24, borderRadius: 20,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    }}>
      <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>{SEASON_NAME} · D-18</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
        <span className="zz-num" style={{ fontSize: 64, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>2</span>
        <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>위</span>
        <div style={{ marginLeft: 'auto' }}>
          <Sparkline data={GROWTH_DATA} width={120} height={36} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontFamily: 'var(--font-num)' }}>
        <div>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>시즌 점수</div>
          <div className="zz-num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-ranked)' }}>1,335</div>
        </div>
        <div style={{ width: 1, height: 28, background: 'var(--border-default)' }} />
        <div>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>이번 주 누적</div>
          <div className="zz-num" style={{ fontSize: 22, fontWeight: 700 }}>+285</div>
        </div>
        <div style={{ width: 1, height: 28, background: 'var(--border-default)' }} />
        <div>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>완등</div>
          <div className="zz-num" style={{ fontSize: 22, fontWeight: 700 }}>14</div>
        </div>
      </div>
    </div>
  );
}

function HomeHero_Empty() {
  return (
    <div style={{
      padding: 32, borderRadius: 20,
      background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, color: 'var(--text-tertiary)' }}>—</div>
      <div className="t-title-lg" style={{ marginTop: 12 }}>첫 문제를 풀어보세요</div>
      <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>완등 후 5초 안에 라이브 보드에 반영됩니다</div>
      <button className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ marginTop: 20 }}>
        <span style={{ fontSize: 18, fontWeight: 400 }}>＋</span> 완등 기록하기
      </button>
    </div>
  );
}

function HomeHero_NoSeasonLeader() {
  return (
    <div style={{
      padding: 32, borderRadius: 20,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      textAlign: 'center',
    }}>
      <div className="t-title-lg">첫 시즌을 만들어보세요</div>
      <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
        색-점수 매핑을 정하고 멤버를 모으세요
      </div>
      <button className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ marginTop: 20 }}>
        시즌 만들기
      </button>
    </div>
  );
}

function HomeHero_Loading() {
  return (
    <div style={{
      padding: 24, borderRadius: 20,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    }}>
      <div className="zz-skel" style={{ height: 14, width: 100, marginBottom: 12 }} />
      <div className="zz-skel" style={{ height: 56, width: '60%', marginBottom: 12 }} />
      <div className="zz-skel" style={{ height: 48, width: '100%' }} />
    </div>
  );
}

function GameHomeMobile({ state = 'leader_idle', onOpenSend, onOpenQuick }) {
  const hero = {
    live_joined: <HomeHero_LiveJoined />,
    live_not_joined: <HomeHero_LiveNotJoined />,
    leader_idle: <HomeHero_LeaderIdle />,
    member_idle: <HomeHero_MemberIdle />,
    empty_member: <HomeHero_Empty />,
    no_season_leader: <HomeHero_NoSeasonLeader />,
    loading: <HomeHero_Loading />,
  }[state];

  const isLive = state === 'live_joined' || state === 'live_not_joined';

  return (
    <div className="zz-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent-ranked)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-num)', fontWeight: 800, fontSize: 14, color: '#fff',
          }}>SB</div>
          <div>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{CREW_NAME}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"/>
            <path d="M9 17a3 3 0 0 0 6 0"/>
          </svg>
        </button>
      </div>

      <div className="zz-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 200px' }}>
        {/* Hero */}
        {hero}

        {/* Quick actions */}
        {state !== 'no_season_leader' && state !== 'loading' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <button onClick={onOpenSend} className="zz-btn zz-btn-secondary" style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: 'auto' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span style={{ fontSize: 13 }}>완등 기록</span>
            </button>
            <button className="zz-btn zz-btn-secondary" style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: 'auto' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z"/></svg>
              <span style={{ fontSize: 13 }}>문제 보드</span>
            </button>
          </div>
        )}

        {/* E3 counter */}
        {state !== 'no_season_leader' && state !== 'loading' && (
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 16, fontFamily: 'var(--font-num)' }}>
            이번 시즌 <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>234</span>건 완등
          </div>
        )}

        {/* Recent activity */}
        {state !== 'loading' && state !== 'no_season_leader' && (
          <div style={{ marginTop: 28 }}>
            <div className="t-title-md" style={{ marginBottom: 12 }}>최근 활동</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTIVITY_FEED.slice(0, 5).map((a, i) => (
                <div key={i} className="zz-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar name={a.initial} color={a.color} size={40} />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, padding: '1px 5px', borderRadius: 9999, background: 'var(--bg-canvas)' }}>
                      <KindBadge kind={a.kind} />
                    </div>
                  </div>
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <div className="t-body-md" style={{ fontWeight: 600 }}>{a.name}</div>
                    <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {a.wall} · {HOLD_COLORS[a.color2].kr} #{a.number} · {a.ago}
                    </div>
                  </div>
                  <div className="zz-num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-ranked)' }}>+{a.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FAB onClick={onOpenSend} />
      <BottomNav active="home" rankedLive={isLive} />
    </div>
  );
}

Object.assign(window, { SeasonDetailMobile, GameHomeMobile, HOME_STATES, Sparkline });
