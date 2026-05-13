// P1 LiveBoardPage — TV 풀스크린 + state variants
function LiveBoardRow({ leader, isFirst }) {
  const c = HOLD_COLORS[leader.last];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto auto',
        alignItems: 'center',
        gap: 32,
        padding: isFirst ? '32px 40px' : '20px 40px',
        background: isFirst ? 'linear-gradient(90deg, rgba(255,210,74,0.16), rgba(255,210,74,0.02))' : 'transparent',
        borderRadius: isFirst ? 20 : 12,
        border: isFirst ? '1px solid rgba(255,210,74,0.35)' : '1px solid transparent',
        marginBottom: isFirst ? 16 : 0,
        boxShadow: isFirst ? 'var(--el-glow-1st)' : 'none',
        position: 'relative',
      }}
    >
      <div
        className="zz-num"
        style={{
          fontSize: isFirst ? 88 : 44,
          fontWeight: 700,
          color: isFirst ? 'var(--accent-win)' : 'var(--text-secondary)',
          lineHeight: 1,
          textAlign: 'right',
        }}
      >
        {leader.rank}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Avatar name={leader.initial} color={leader.color} size={isFirst ? 96 : 64} />
        <div>
          <div style={{ fontSize: isFirst ? 44 : 26, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {leader.name}
          </div>
          <div style={{ fontSize: isFirst ? 18 : 14, color: 'var(--text-tertiary)', marginTop: 6, fontFamily: 'var(--font-num)' }}>
            {leader.sends}완등 · 마지막 {HOLD_COLORS[leader.last].kr}
          </div>
        </div>
      </div>
      <div
        style={{
          width: isFirst ? 36 : 24, height: isFirst ? 36 : 24,
          borderRadius: 9999, background: c.hex,
          outline: leader.last === 'white' || leader.last === 'black' ? '1px solid var(--border-strong)' : 'none',
        }}
      />
      <div
        className="zz-num"
        style={{
          fontSize: isFirst ? 96 : 56,
          fontWeight: 700,
          lineHeight: 1,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          minWidth: isFirst ? 260 : 200,
          textAlign: 'right',
        }}
      >
        {leader.score.toLocaleString()}
      </div>
    </div>
  );
}

function LiveBoardTV({ state = 'live', mode = 'session' }) {
  // state: 'live' | 'loading' | 'empty' | 'reconnecting'
  return (
    <div className="zz-tv zz-noise" style={{
      background: 'radial-gradient(120% 90% at 30% 0%, #1A1A1F 0%, #0A0A0B 60%)',
      color: 'var(--text-primary)', padding: 48,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-num)', fontWeight: 800, fontSize: 22, color: 'var(--accent-ranked)',
          }}>SB</div>
          <div>
            <div style={{ fontSize: 18, color: 'var(--text-tertiary)', fontWeight: 500 }}>{CREW_NAME}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span className="kind-pill ranked" style={{ fontSize: 13, padding: '5px 12px' }}>RANKED</span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{mode === 'session' ? '토요 현장 랭크전' : 'Session: live'}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="t-title-xl" style={{ fontWeight: 700 }}>{SEASON_NAME}</div>
          <div style={{ fontSize: 16, color: 'var(--text-tertiary)', marginTop: 4 }}>2026.05.01 — 2026.05.31</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.1em' }}>SESSION ENDS IN</div>
          <div className="zz-num" style={{
            fontSize: 88, fontWeight: 800, lineHeight: 1, marginTop: 6,
            color: 'var(--accent-win)', letterSpacing: '-0.02em',
            textShadow: '0 0 40px rgba(255,210,74,0.4)',
          }}>04:38</div>
        </div>
      </div>

      {/* Reconnecting pill */}
      {state === 'reconnecting' && (
        <div style={{
          position: 'absolute', top: 32, right: 32, zIndex: 10,
          padding: '8px 16px', borderRadius: 9999, background: 'rgba(239,68,68,0.15)',
          border: '1px solid var(--accent-alert)', color: 'var(--accent-alert)',
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--accent-alert)' }} className="zz-pulse" />
          재연결 중…
        </div>
      )}

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: 32, flex: 1, minHeight: 0 }}>
        {/* Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column' }} role="status" aria-live="polite">
          {state === 'loading' && (
            <>
              {[0,1,2,3,4].map(i => (
                <div key={i} className="zz-skel" style={{ height: i === 0 ? 140 : 88, marginBottom: 12, borderRadius: 16 }} />
              ))}
            </>
          )}
          {state === 'empty' && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              border: '1px dashed var(--border-default)', borderRadius: 24, padding: 64,
            }}>
              <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--text-tertiary)' }}>—</div>
              <div className="t-display-md" style={{ marginTop: 24, color: 'var(--text-primary)' }}>첫 풀이를 기다리고 있어요</div>
              <div style={{ fontSize: 22, color: 'var(--text-secondary)', marginTop: 16 }}>
                활성 멤버 <span className="zz-num" style={{ color: 'var(--accent-ranked)' }}>14</span>명
              </div>
            </div>
          )}
          {(state === 'live' || state === 'reconnecting') && LEADERS.slice(0, 6).map(l => (
            <LiveBoardRow key={l.rank} leader={l} isFirst={l.rank === 1} />
          ))}
        </div>

        {/* Activity feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
            ACTIVITY
          </div>
          {/* Live toast */}
          {state === 'live' && (
            <div className="zz-slidein" style={{
              padding: 24, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(255,59,92,0.2), rgba(255,59,92,0.04))',
              border: '1px solid var(--accent-ranked)',
              boxShadow: 'var(--el-glow-ranked)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--accent-ranked)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
                ⚡ 방금 풀이!
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar name="한" color="#22C55E" size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>한지우</div>
                  <div style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 2 }}>
                    B벽 빨강 #7
                  </div>
                </div>
                <div className="zz-num" style={{ fontSize: 40, fontWeight: 800, color: 'var(--accent-ranked)' }}>+140</div>
              </div>
            </div>
          )}
          {(state === 'live' || state === 'reconnecting') && ACTIVITY_FEED.slice(1, 6).map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px' }}>
              <Avatar name={a.initial} color={a.color} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
                  {a.wall} · {HOLD_COLORS[a.color2].kr} #{a.number}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <div className="zz-num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-ranked)' }}>+{a.score}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{a.ago}</div>
              </div>
            </div>
          ))}
          {state === 'loading' && (
            <>
              {[0,1,2,3].map(i => (
                <div key={i} className="zz-skel" style={{ height: 72, borderRadius: 16 }} />
              ))}
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 48, fontSize: 13, color: 'var(--text-tertiary)', letterSpacing: '0.2em', fontWeight: 600 }}>
        ZUGZAG · GAME
      </div>
      <div style={{ position: 'absolute', bottom: 24, right: 48, fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'var(--font-num)' }}>
        E3 · 누적 {127 + LEADERS.reduce((s,l) => s + l.sends, 0)}건 완등
      </div>
    </div>
  );
}

// ----- P10 TV Display state variants -----
function TVPreSession() {
  const [time, setTime] = React.useState('00:14:22');
  return (
    <div className="zz-tv zz-noise" style={{
      background: 'radial-gradient(80% 60% at 50% 40%, #1A1A1F, #0A0A0B 70%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ fontSize: 24, color: 'var(--text-tertiary)', letterSpacing: '0.2em', fontWeight: 600 }}>{CREW_NAME}</div>
      <div className="t-display-md" style={{ marginTop: 24, color: 'var(--text-secondary)', fontWeight: 500 }}>곧 시작합니다</div>
      <div style={{ fontSize: 56, fontWeight: 700, marginTop: 32, letterSpacing: '-0.02em' }}>토요 현장 랭크전</div>
      <div className="zz-num zz-pulse" style={{
        fontSize: 200, fontWeight: 800, marginTop: 48,
        color: 'var(--accent-win)', letterSpacing: '-0.04em',
        textShadow: '0 0 80px rgba(255,210,74,0.5)',
      }}>{time}</div>
      <div style={{ fontSize: 20, color: 'var(--text-tertiary)', marginTop: 32, fontFamily: 'var(--font-num)' }}>참가 신청 14명 / 시작까지</div>
    </div>
  );
}

function TVCeremony() {
  return (
    <div className="zz-tv zz-noise" style={{
      background: 'radial-gradient(70% 60% at 50% 40%, rgba(255,210,74,0.18), #0A0A0B 75%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80,
    }}>
      <div style={{ fontSize: 24, color: 'var(--accent-win)', letterSpacing: '0.3em', fontWeight: 700 }}>
        SEASON CHAMPION
      </div>
      <div style={{ fontSize: 40, color: 'var(--text-secondary)', marginTop: 24, fontWeight: 600 }}>
        2026 5월 랭크전 종료
      </div>
      <div className="zz-glow1st" style={{
        marginTop: 64, padding: '64px 96px',
        border: '2px solid rgba(255,210,74,0.4)', borderRadius: 32,
        background: 'linear-gradient(180deg, rgba(255,210,74,0.08), transparent)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <Avatar name="윤" color="#FFD24A" size={160} />
        <div style={{ fontSize: 120, fontWeight: 800, marginTop: 32, color: 'var(--accent-win)', letterSpacing: '-0.03em' }}>
          윤소이
        </div>
        <div className="zz-num" style={{ fontSize: 80, fontWeight: 800, marginTop: 16, letterSpacing: '-0.02em' }}>
          1,820<span style={{ fontSize: 32, color: 'var(--text-tertiary)', marginLeft: 12 }}>점</span>
        </div>
      </div>
    </div>
  );
}

function TVExpired({ revoked = false }) {
  return (
    <div className="zz-tv" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#0A0A0B', color: 'var(--text-secondary)', padding: 80,
    }}>
      <div style={{ width: 96, height: 96, borderRadius: 24, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-num)', fontWeight: 800, fontSize: 36, color: 'var(--text-tertiary)' }}>SB</div>
      <div style={{ fontSize: 56, fontWeight: 700, marginTop: 48, color: 'var(--text-primary)' }}>
        {revoked ? 'TV 접속이 취소되었습니다' : 'TV 모드 만료'}
      </div>
      <div style={{ fontSize: 22, marginTop: 16 }}>운영자에게 새 URL 요청</div>
      <div style={{ fontSize: 14, color: 'var(--text-tertiary)', fontFamily: 'var(--font-num)', marginTop: 96, letterSpacing: '0.2em' }}>
        ZUGZAG · GAME
      </div>
    </div>
  );
}

function TVNoData() {
  return (
    <div className="zz-tv zz-noise" style={{
      background: 'radial-gradient(120% 90% at 30% 0%, #1A1A1F 0%, #0A0A0B 60%)',
      padding: 48, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-num)', fontWeight: 800, fontSize: 22, color: 'var(--accent-ranked)',
          }}>SB</div>
          <div>
            <div style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>{CREW_NAME}</div>
            <div className="t-title-xl" style={{ marginTop: 4 }}>{SEASON_NAME}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>STARTS IN</div>
          <div className="zz-num" style={{ fontSize: 64, fontWeight: 800, color: 'var(--accent-win)', marginTop: 4 }}>02:14</div>
        </div>
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        border: '1px dashed var(--border-default)', borderRadius: 32, padding: 80,
      }}>
        <div style={{ fontSize: 120, fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '-0.03em' }}>—</div>
        <div className="t-display-md" style={{ marginTop: 32 }}>첫 풀이를 기다리는 중</div>
        <div style={{ fontSize: 22, color: 'var(--text-secondary)', marginTop: 16 }}>
          활성 멤버 <span className="zz-num" style={{ color: 'var(--accent-ranked)', fontWeight: 700 }}>14</span>명
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LiveBoardTV, TVPreSession, TVCeremony, TVExpired, TVNoData, LiveBoardRow });
