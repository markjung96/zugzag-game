// P9 AdminDashboard, P11 OG Cards (Champion + Personal), P12 SharedSeasonLanding

function AdminDashboardDesktop() {
  const hourBars = [0,0,0,0,0,0,0,1,3,6,9,7,11,13,18,21,28,32,36,29,22,14,8,3].map(v => v);
  const max = Math.max(...hourBars);

  return (
    <div className="zz-screen" style={{ padding: 48, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: 'var(--text-tertiary)' }}>
          <span className="t-body-sm">운영</span>
          <span>/</span>
          <span className="t-body-sm" style={{ color: 'var(--text-primary)' }}>대시보드</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 className="t-title-xl">시즌 · 2026 5월 랭크전</h1>
            <div className="t-body-md" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              시작 13일째 · 종료 D-18 · 14명 참가
            </div>
          </div>
          <button className="zz-btn zz-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            CSV 다운로드 (이번 시즌 전체)
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
        {[
          { label: '오늘 RANKED', value: 47, delta: '+12', good: true, accent: 'var(--accent-ranked)' },
          { label: '오늘 CASUAL', value: 23, delta: '-4', good: false, accent: 'var(--text-secondary)' },
          { label: '이번 주 누적', value: 312, delta: '+58', good: true, accent: 'var(--text-primary)' },
        ].map(k => (
          <div key={k.label} className="zz-card" style={{ padding: 24 }}>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em' }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
              <div className="zz-num" style={{ fontSize: 56, fontWeight: 800, color: k.accent, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {k.value}
              </div>
              <div className="zz-num" style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                background: k.good ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: k.good ? 'var(--accent-success)' : 'var(--accent-alert)',
              }}>{k.delta}</div>
            </div>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 4 }}>전일 대비</div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="zz-card" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <div className="t-title-md">시간대별 완등 분포</div>
            <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>오늘 · 빨강 = RANKED, 외곽선 = CASUAL</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-num)', fontSize: 13 }}>
            <span style={{ color: 'var(--accent-ranked)', fontWeight: 700 }}>● RANKED 47</span>
            <span style={{ color: 'var(--text-secondary)' }}>○ CASUAL 23</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hourBars.length}, 1fr)`, alignItems: 'flex-end', gap: 4, height: 120 }}>
          {hourBars.map((v, i) => {
            const ratio = max ? v / max : 0;
            const cas = Math.max(0, Math.round(v * 0.3));
            const rnk = v - cas;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'stretch', height: '100%', gap: 1 }}>
                <div style={{ height: `${(rnk / max) * 100}%`, background: 'var(--accent-ranked)', borderRadius: '3px 3px 0 0', minHeight: rnk ? 2 : 0 }} />
                <div style={{ height: `${(cas / max) * 100}%`, border: '1px solid var(--accent-ranked)', borderRadius: '0 0 3px 3px', minHeight: cas ? 4 : 0, opacity: 0.6 }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hourBars.length}, 1fr)`, marginTop: 8, fontFamily: 'var(--font-num)', fontSize: 10, color: 'var(--text-tertiary)' }}>
          {hourBars.map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>{i % 3 === 0 ? i : ''}</div>
          ))}
        </div>
      </div>

      {/* User table */}
      <div className="zz-card" style={{ padding: 0, marginTop: 24, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="t-title-md">사용자별 분포</div>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>14명</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-kr)' }}>
          <thead>
            <tr style={{ color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.06em', fontWeight: 700, textAlign: 'left' }}>
              <th style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-default)' }}>닉네임</th>
              <th style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>RANKED</th>
              <th style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>CASUAL</th>
              <th style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>점수 합계</th>
              <th style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>최근 풀이</th>
            </tr>
          </thead>
          <tbody>
            {LEADERS.slice(0, 7).map(l => (
              <tr key={l.rank} style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={l.initial} color={l.color} size={28} />
                  <span className="t-body-md">{l.name}</span>
                </td>
                <td className="zz-num" style={{ padding: '14px 24px', textAlign: 'right', color: 'var(--accent-ranked)', fontWeight: 700 }}>{l.sends}</td>
                <td className="zz-num" style={{ padding: '14px 24px', textAlign: 'right', color: 'var(--text-secondary)' }}>{Math.round(l.sends * 0.4)}</td>
                <td className="zz-num" style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 700 }}>{l.score.toLocaleString()}</td>
                <td className="zz-num" style={{ padding: '14px 24px', textAlign: 'right', color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: HOLD_COLORS[l.last].hex }} />
                    방금
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----- P11 OG Cards (1200x630) -----
function OGChampionCard() {
  return (
    <div style={{
      width: 1200, height: 630, position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(60% 80% at 20% 20%, rgba(255,210,74,0.18), transparent 60%), #0A0A0B',
      color: 'var(--text-primary)', fontFamily: 'var(--font-kr)',
      padding: 64, display: 'flex', flexDirection: 'column',
    }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.2em', fontSize: 14, fontWeight: 700, color: 'var(--text-tertiary)' }}>
        <span style={{ display: 'inline-block', width: 24, height: 24, background: 'var(--accent-ranked)', borderRadius: 6 }} />
        ZUGZAG · GAME
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="t-body-md" style={{ color: 'var(--text-secondary)', fontSize: 22, letterSpacing: '0.04em' }}>
          2026 5월 랭크전 챔피언
        </div>
        <div style={{
          fontSize: 160, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em',
          color: 'var(--accent-win)', marginTop: 16,
          textShadow: '0 0 60px rgba(255,210,74,0.4)',
        }}>
          윤소이
        </div>
        <div className="zz-num" style={{ fontSize: 88, fontWeight: 800, marginTop: 16, letterSpacing: '-0.02em' }}>
          1,820<span style={{ fontSize: 32, color: 'var(--text-tertiary)', marginLeft: 12 }}>점</span>
          <span style={{ fontSize: 28, color: 'var(--text-secondary)', marginLeft: 24 }}>14완등</span>
        </div>
      </div>

      {/* Crew + holds */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(HOLD_COLORS).map(([k, c]) => (
            <div key={k} style={{
              width: 16, height: 16, borderRadius: 9999, background: c.hex,
              outline: k === 'white' || k === 'black' ? '1px solid #71717A' : 'none',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--accent-ranked)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-num)', fontWeight: 800, fontSize: 16, color: '#fff',
          }}>SB</div>
          <div style={{ fontSize: 20, color: 'var(--text-secondary)', fontWeight: 600 }}>{CREW_NAME}</div>
        </div>
      </div>
    </div>
  );
}

function OGPersonalCard() {
  return (
    <div style={{
      width: 1200, height: 630, position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(60% 80% at 80% 20%, rgba(255,59,92,0.16), transparent 60%), #0A0A0B',
      color: 'var(--text-primary)', fontFamily: 'var(--font-kr)',
      padding: 64, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.2em', fontSize: 14, fontWeight: 700, color: 'var(--text-tertiary)' }}>
        <span style={{ display: 'inline-block', width: 24, height: 24, background: 'var(--accent-ranked)', borderRadius: 6 }} />
        ZUGZAG · GAME
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="t-body-md" style={{ color: 'var(--text-secondary)', fontSize: 22 }}>내 시즌 결과</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, marginTop: 12, letterSpacing: '-0.03em' }}>
          강민혁
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 64, marginTop: 40 }}>
          {[
            { label: '순위', value: '2', unit: '위', color: 'var(--accent-ranked)' },
            { label: '점수', value: '1,335', unit: '점', color: 'var(--text-primary)' },
            { label: '완등', value: '14', unit: '건', color: 'var(--text-primary)' },
          ].map(s => (
            <div key={s.label}>
              <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', fontSize: 14 }}>{s.label}</div>
              <div className="zz-num" style={{ fontSize: 72, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
                {s.value}<span style={{ fontSize: 22, color: 'var(--text-tertiary)', marginLeft: 6, fontWeight: 700 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{ marginTop: 32 }}>
          <Sparkline data={GROWTH_DATA} width={400} height={64} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>2026 5월 랭크전 · 2026.05.01 – 05.31</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--accent-ranked)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-num)', fontWeight: 800, fontSize: 16, color: '#fff',
          }}>SB</div>
          <div style={{ fontSize: 20, color: 'var(--text-secondary)', fontWeight: 600 }}>{CREW_NAME}</div>
        </div>
      </div>
    </div>
  );
}

// ----- P12 SharedSeasonLanding -----
function SharedSeasonLanding() {
  return (
    <div className="zz-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="zz-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 140px' }}>
        {/* Champion hero */}
        <div style={{
          padding: 24, borderRadius: 24,
          background: 'radial-gradient(60% 80% at 30% 20%, rgba(255,210,74,0.18), transparent 60%), var(--bg-surface)',
          border: '1px solid rgba(255,210,74,0.3)',
          textAlign: 'center',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(255,210,74,0.12)', color: 'var(--accent-win)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
            SEASON CHAMPION
          </div>
          <div style={{ marginTop: 20 }}>
            <Avatar name="윤" color="#FFD24A" size={80} />
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, marginTop: 12, color: 'var(--accent-win)', letterSpacing: '-0.02em' }}>
            윤소이
          </div>
          <div className="zz-num" style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
            1,820<span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 6 }}>점</span>
          </div>
          <div className="t-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 12 }}>
            2026 5월 랭크전 종료
          </div>
        </div>

        {/* Top 3 */}
        <div style={{ marginTop: 24 }}>
          <div className="t-title-md" style={{ marginBottom: 12 }}>Top 3</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEADERS.slice(0, 3).map(l => (
              <div key={l.rank} className="zz-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <MedalRing rank={l.rank} />
                <Avatar name={l.initial} color={l.color} size={36} />
                <div style={{ flex: 1 }}>
                  <div className="t-body-md" style={{ fontWeight: 600 }}>{l.name}</div>
                  <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>{l.sends}완등</div>
                </div>
                <div className="zz-num" style={{ fontSize: 18, fontWeight: 700 }}>{l.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'center' }}>
            총 14명 참가 · 234건 완등
          </div>
        </div>

        {/* Brand line */}
        <div style={{
          marginTop: 32, padding: 20, borderRadius: 16,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        }}>
          <div className="t-body-sm" style={{ color: 'var(--text-secondary)' }}>
            zugzag-game은 zugzag 크루의 라이브 랭크전 서비스입니다.
            우리 크루의 풀이가 곧 점수가 되고, 점수가 곧 순위가 됩니다.
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 24px', background: 'rgba(10,10,11,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-default)',
      }}>
        <button className="zz-btn zz-btn-primary zz-btn-tall zz-btn-full" style={{ fontSize: 16 }}>
          zugzag에서 우리 크루 만들기
        </button>
        <button className="zz-btn zz-btn-ghost zz-btn-full" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          zugzag 가입
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { AdminDashboardDesktop, OGChampionCard, OGPersonalCard, SharedSeasonLanding });
