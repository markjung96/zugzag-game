// Main app — design canvas with all 12 screens + primitives

function PrimitivesShowcase() {
  return (
    <div style={{ padding: 32, background: 'var(--bg-canvas)', minHeight: 720, color: 'var(--text-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Badges */}
        <section>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>SESSION KIND BADGE</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <KindBadge kind="ranked" />
            <span className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>solid pill · 시즌 점수 적립</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <KindBadge kind="casual" />
            <span className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>outline · 기록만 남음</span>
          </div>
        </section>

        {/* FAB */}
        <section>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>FAB · 완등 기록</div>
          <div style={{ position: 'relative', height: 80, width: 160 }}>
            <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
              <button style={{
                background: 'var(--accent-ranked)', color: '#fff', border: 'none', borderRadius: 9999,
                padding: '14px 20px', fontFamily: 'var(--font-kr)', fontWeight: 700, fontSize: 15,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(255,59,92,0.45)',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 20, lineHeight: 0, fontWeight: 300 }}>＋</span>
                <span>기록</span>
              </button>
            </div>
          </div>
        </section>

        {/* Hold chips */}
        <section style={{ gridColumn: '1 / -1' }}>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>HOLD COLOR CHIPS</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.keys(HOLD_COLORS).map((c, i) => (
              <HoldChip key={c} color={c} number={i+1} size={60} done={i === 3} attempted={i === 5} />
            ))}
          </div>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 12 }}>
            min 60×60 (a11y.touch-target.game) · white/black은 outline 강제 · 완등 = 체크 + 0.55 opacity · 시도-미완등 = 점선 테두리
          </div>
        </section>

        {/* Toasts */}
        <section style={{ gridColumn: '1 / -1' }}>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>TOASTS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
            <Toast>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: 'var(--accent-ranked)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-num)' }}>+</div>
              <div>
                <div className="t-body-md" style={{ fontWeight: 600 }}>+140점!</div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>시즌 3위 → 2위 · B벽 빨강 #7</div>
              </div>
            </Toast>
            <Toast>
              <div style={{ width: 36, height: 36, borderRadius: 9999, border: '1px solid var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 800, fontFamily: 'var(--font-num)', fontSize: 13 }}>5</div>
              <div>
                <div className="t-body-md" style={{ fontWeight: 600 }}>오늘 5건째 풀이 기록!</div>
                <div className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>CASUAL — 시즌 점수에 미반영</div>
              </div>
            </Toast>
          </div>
        </section>

        {/* Avatars */}
        <section style={{ gridColumn: '1 / -1' }}>
          <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>AVATARS (이니셜 + 크루 색)</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {LEADERS.slice(0, 6).map(l => <Avatar key={l.name} name={l.initial} color={l.color} size={48} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

// Wraps a screen content so design canvas can render at proper size
function ScreenWrap({ children, w, h }) {
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

// ----- Interactive home (state cycler) -----
function InteractiveHome() {
  const [state, setState] = React.useState('member_idle');
  const [showSend, setShowSend] = React.useState(false);
  const [showQuick, setShowQuick] = React.useState(false);

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* State picker */}
      <div style={{
        padding: 16, background: 'var(--bg-surface)', borderRadius: 16,
        border: '1px solid var(--border-default)', minWidth: 240,
      }}>
        <div className="t-body-sm" style={{ color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>HERO 상태</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {HOME_STATES.map(s => (
            <button key={s.id} onClick={() => setState(s.id)} style={{
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
              background: state === s.id ? 'rgba(255,59,92,0.1)' : 'transparent',
              color: state === s.id ? 'var(--accent-ranked)' : 'var(--text-secondary)',
              border: 'none', textAlign: 'left',
              fontSize: 13, fontWeight: state === s.id ? 700 : 500,
            }}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-default)' }}>
          <button onClick={() => setShowSend(true)} className="zz-btn zz-btn-primary" style={{ width: '100%', marginBottom: 8 }}>
            완등 기록 모달 열기
          </button>
          <button onClick={() => setShowQuick(true)} className="zz-btn zz-btn-secondary" style={{ width: '100%' }}>
            즉석 랭크전 모달
          </button>
        </div>
      </div>

      {/* Phone */}
      <div>
        <Phone>
          <GameHomeMobile state={state} onOpenSend={() => setShowSend(true)} onOpenQuick={() => setShowQuick(true)} />
          {showSend && <SendModal mode={state === 'live_joined' || state === 'live_not_joined' ? 'ranked' : (state === 'empty_member' ? 'casual' : 'ranked')} onClose={() => setShowSend(false)} />}
          {showQuick && <QuickRankedSheet onClose={() => setShowQuick(false)} />}
        </Phone>
      </div>
    </div>
  );
}

// ----- App: Design Canvas with all artboards -----
function App() {
  return (
    <DesignCanvas
      title="zugzag-game · Phase 1"
      subtitle="Korean climbing crew · 라이브 랭크전 PWA · 12 screens + primitives"
    >
      {/* === Brand / Primitives === */}
      <DCSection id="primitives" title="Component Primitives" subtitle="Session Kind Badge · FAB · Hold Chip · Toast · Avatar">
        <DCArtboard id="primitives-all" label="Primitives library" width={1200} height={720}>
          <PrimitivesShowcase />
        </DCArtboard>
      </DCSection>

      {/* === P1 + P10 TV === */}
      <DCSection id="tv" title="P1 · P10 — TV LiveBoard" subtitle="16:9 풀스크린 · 시야 거리 2-5m · 9-state matrix">
        <DCArtboard id="p1-live" label="P1 LiveBoard · live (ranked session, 04:38 남음)" width={1920} height={1080}>
          <LiveBoardTV state="live" />
        </DCArtboard>
        <DCArtboard id="p1-empty" label="P1 · empty (첫 풀이 대기)" width={1920} height={1080}>
          <LiveBoardTV state="empty" />
        </DCArtboard>
        <DCArtboard id="p1-loading" label="P1 · loading skeleton" width={1920} height={1080}>
          <LiveBoardTV state="loading" />
        </DCArtboard>
        <DCArtboard id="p10-reconnect" label="P10 · SSE 재연결" width={1920} height={1080}>
          <LiveBoardTV state="reconnecting" />
        </DCArtboard>
        <DCArtboard id="p10-pre" label="P10 · pre-session (곧 시작)" width={1920} height={1080}>
          <TVPreSession />
        </DCArtboard>
        <DCArtboard id="p10-ceremony" label="P10 · ceremony (E8 의식 카드)" width={1920} height={1080}>
          <TVCeremony />
        </DCArtboard>
        <DCArtboard id="p10-nodata" label="P10 · no-data (활성 멤버 N명 표시)" width={1920} height={1080}>
          <TVNoData />
        </DCArtboard>
        <DCArtboard id="p10-expired" label="P10 · expired (토큰 만료)" width={1920} height={1080}>
          <TVExpired />
        </DCArtboard>
        <DCArtboard id="p10-revoked" label="P10 · revoked (운영자 취소)" width={1920} height={1080}>
          <TVExpired revoked />
        </DCArtboard>
      </DCSection>

      {/* === Interactive home === */}
      <DCSection id="interactive" title="P5 · Interactive Home" subtitle="State machine 시연 — 클릭해서 hero 상태 전환, 모달 열기">
        <DCArtboard id="interactive-home" label="Live prototype · 상태 전환 + 모달" width={680} height={900}>
          <InteractiveHome />
        </DCArtboard>
      </DCSection>

      {/* === P5 Home states === */}
      <DCSection id="p5" title="P5 — GameHome · State Machine" subtitle="한 순간 한 hero · 카드 dashboard 금지">
        <DCArtboard id="p5-live-not-joined" label="① LIVE · 미참가 (참가하기 CTA)" width={406} height={860}>
          <Phone><GameHomeMobile state="live_not_joined" /></Phone>
        </DCArtboard>
        <DCArtboard id="p5-live-joined" label="② LIVE · 참가함 (라이브 보드 보기)" width={406} height={860}>
          <Phone><GameHomeMobile state="live_joined" /></Phone>
        </DCArtboard>
        <DCArtboard id="p5-leader" label="③ 리더 · 시즌 진행 (즉석 랭크전 열기)" width={406} height={860}>
          <Phone><GameHomeMobile state="leader_idle" /></Phone>
        </DCArtboard>
        <DCArtboard id="p5-member" label="④ 멤버 · 시즌 진행 (내 순위 hero)" width={406} height={860}>
          <Phone><GameHomeMobile state="member_idle" /></Phone>
        </DCArtboard>
        <DCArtboard id="p5-empty" label="⑤ 첫 풀이 0건 (empty)" width={406} height={860}>
          <Phone><GameHomeMobile state="empty_member" /></Phone>
        </DCArtboard>
        <DCArtboard id="p5-noseason" label="⑥ 시즌 없음 · 리더" width={406} height={860}>
          <Phone><GameHomeMobile state="no_season_leader" /></Phone>
        </DCArtboard>
        <DCArtboard id="p5-loading" label="⑦ Loading skeleton" width={406} height={860}>
          <Phone><GameHomeMobile state="loading" /></Phone>
        </DCArtboard>
      </DCSection>

      {/* === P2 Problem board === */}
      <DCSection id="p2" title="P2 — ProblemBoard · 벽×색 그리드">
        <DCArtboard id="p2-live" label="P2 · live (FAB visible)" width={406} height={860}>
          <Phone><ProblemBoardMobile state="live" /></Phone>
        </DCArtboard>
        <DCArtboard id="p2-loading" label="P2 · loading" width={406} height={860}>
          <Phone><ProblemBoardMobile state="loading" /></Phone>
        </DCArtboard>
        <DCArtboard id="p2-empty" label="P2 · empty (이번 세팅 0건)" width={406} height={860}>
          <Phone><ProblemBoardMobile state="empty" /></Phone>
        </DCArtboard>
      </DCSection>

      {/* === P3 Send modal — every step === */}
      <DCSection id="p3" title="P3 — SendRecordModal · 3-step wizard" subtitle="ranked vs casual 분기 + Score preview states">
        <DCArtboard id="p3-step1" label="Step 1 · 벽 선택" width={406} height={860}>
          <Phone><SendModal initialStep={1} mode="ranked" /></Phone>
        </DCArtboard>
        <DCArtboard id="p3-step2" label="Step 2 · 색/번호" width={406} height={860}>
          <Phone><SendModal initialStep={2} mode="ranked" /></Phone>
        </DCArtboard>
        <DCArtboard id="p3-step3-ranked" label="Step 3 · RANKED (+140점)" width={406} height={860}>
          <Phone><SendModal initialStep={3} mode="ranked" /></Phone>
        </DCArtboard>
        <DCArtboard id="p3-step3-casual" label="Step 3 · CASUAL (기록만)" width={406} height={860}>
          <Phone><SendModal initialStep={3} mode="casual" /></Phone>
        </DCArtboard>
        <DCArtboard id="p3-stale" label="Step 3 · STALE preview" width={406} height={860}>
          <Phone><SendModal initialStep={3} mode="ranked" state="stale" /></Phone>
        </DCArtboard>
        <DCArtboard id="p3-offline" label="Step 3 · OFFLINE (점수 라인 숨김)" width={406} height={860}>
          <Phone><SendModal initialStep={3} mode="ranked" state="offline" /></Phone>
        </DCArtboard>
      </DCSection>

      {/* === P4 Season detail === */}
      <DCSection id="p4" title="P4 — SeasonDetail · 시즌 랭킹">
        <DCArtboard id="p4-mobile" label="P4 · 모바일 (랭킹이 주인공)" width={406} height={860}>
          <Phone><SeasonDetailMobile /></Phone>
        </DCArtboard>
      </DCSection>

      {/* === P6/P7/P8 === */}
      <DCSection id="admin" title="P6 · P7 · P8 — Admin flows">
        <DCArtboard id="p6-desktop" label="P6 · 시즌 만들기 (desktop · sticky 요약)" width={1280} height={840}>
          <SeasonCreateDesktop />
        </DCArtboard>
        <DCArtboard id="p7-form" label="P7 · 즉석 랭크전 (bottom sheet · form)" width={406} height={860}>
          <Phone><QuickRankedSheet stage="form" /></Phone>
        </DCArtboard>
        <DCArtboard id="p7-success" label="P7 · 시작! (QR + URL)" width={406} height={860}>
          <Phone><QuickRankedSheet stage="success" /></Phone>
        </DCArtboard>
        <DCArtboard id="p8-desktop" label="P8 · TV Token 발급 (desktop)" width={1280} height={840}>
          <TVTokenDesktop />
        </DCArtboard>
      </DCSection>

      {/* === P9 dashboard === */}
      <DCSection id="p9" title="P9 — AdminDashboard · KPI strip first">
        <DCArtboard id="p9-desktop" label="P9 · KPI + sparkline + CSV + table" width={1280} height={1080}>
          <AdminDashboardDesktop />
        </DCArtboard>
      </DCSection>

      {/* === P11 OG === */}
      <DCSection id="p11" title="P11 — OG ImageCards · 1200×630" subtitle="숫자 중심 포스터 · 사진 위 텍스트 금지">
        <DCArtboard id="p11-champion" label="(a) 시즌 챔피언 카드 — auto-generated for 1위" width={1200} height={630}>
          <OGChampionCard />
        </DCArtboard>
        <DCArtboard id="p11-personal" label="(b) 개인 카드 — owner_token으로 발급" width={1200} height={630}>
          <OGPersonalCard />
        </DCArtboard>
      </DCSection>

      {/* === P12 Shared === */}
      <DCSection id="p12" title="P12 — SharedSeasonLanding · 비인증 OG 진입">
        <DCArtboard id="p12-mobile" label="P12 · 모바일 · sticky CTA" width={406} height={860}>
          <Phone><SharedSeasonLanding /></Phone>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
