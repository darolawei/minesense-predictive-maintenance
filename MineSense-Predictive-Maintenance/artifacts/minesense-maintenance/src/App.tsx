import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Gauge,
  HardHat,
  LayoutDashboard,
  ListFilter,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Truck,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Asset = {
  id: string;
  name: string;
  type: string;
  location: string;
  health: number;
  risk: 'Low' | 'Medium' | 'High';
  uptime: string;
  lastService: string;
  nextService: string;
  operatingHours: number;
  signal: string;
};

type Event = {
  id: number;
  asset: string;
  type: string;
  date: string;
  duration: string;
  status: 'Scheduled' | 'In progress' | 'Completed';
};

const assets: Asset[] = [
  { id: 'haul-01', name: 'Komatsu 930E · HD-07', type: 'Haul truck', location: 'Pit 3 · North ramp', health: 74, risk: 'Medium', uptime: '91.8%', lastService: '08 Sep 2026', nextService: '21 Sep 2026', operatingHours: 12480, signal: 'Vibration' },
  { id: 'crusher-02', name: 'Metso C160 · CR-02', type: 'Primary crusher', location: 'Crushing plant', health: 48, risk: 'High', uptime: '86.4%', lastService: '29 Aug 2026', nextService: '14 Sep 2026', operatingHours: 18742, signal: 'Temperature' },
  { id: 'exc-04', name: 'CAT 6060 · EX-04', type: 'Hydraulic excavator', location: 'Pit 2 · West cut', health: 88, risk: 'Low', uptime: '96.7%', lastService: '03 Sep 2026', nextService: '02 Oct 2026', operatingHours: 9820, signal: 'Pressure' },
  { id: 'conveyor-01', name: 'Sandvik CV-12 · CV-01', type: 'Overland conveyor', location: 'ROM to plant', health: 67, risk: 'Medium', uptime: '93.2%', lastService: '01 Sep 2026', nextService: '25 Sep 2026', operatingHours: 21604, signal: 'Oil condition' },
];

const eventSeed: Event[] = [
  { id: 1, asset: 'Metso C160 · CR-02', type: 'Bearing inspection', date: '14 Sep · 06:00', duration: '4h', status: 'Scheduled' },
  { id: 2, asset: 'Komatsu 930E · HD-07', type: 'Vibration sensor check', date: '21 Sep · 13:30', duration: '2h', status: 'Scheduled' },
  { id: 3, asset: 'Sandvik CV-12 · CV-01', type: 'Oil sampling', date: '12 Sep · 09:00', duration: '1h', status: 'Completed' },
  { id: 4, asset: 'CAT 6060 · EX-04', type: 'Hydraulic service', date: '05 Sep · 07:00', duration: '6h', status: 'Completed' },
];

const makeSeries = (range: string, offset = 0) => {
  const labels = range === '24h' ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'] : range === '7d' ? ['08 Sep', '09 Sep', '10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep'] : ['Jun', 'Jul', 'Aug', 'Sep'];
  return labels.map((time, i) => ({
    time,
    temperature: Math.round(79 + Math.sin(i * 0.9) * 4 + i * 1.2 + offset),
    vibration: Number((4.1 + Math.cos(i * 0.72) * 0.55 + i * 0.07 + offset / 10).toFixed(1)),
    pressure: Math.round(286 + Math.sin(i * 1.3) * 9 - i * 1.5 + offset),
    risk: Math.round(34 + Math.sin(i * 0.78) * 7 + i * 2 + offset),
  }));
};

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Fleet', icon: Truck },
  { label: 'Maintenance', icon: Wrench },
  { label: 'Data Explorer', icon: Activity },
];

function MetricCard({ label, value, sub, tone, icon: Icon, trend }: { label: string; value: string; sub: string; tone: 'amber' | 'teal' | 'red' | 'slate'; icon: typeof Activity; trend?: 'up' | 'down' }) {
  const toneStyles = { amber: 'metric-amber', teal: 'metric-teal', red: 'metric-red', slate: 'metric-slate' };
  return (
    <motion.div whileHover={{ y: -2 }} className={`metric-card ${toneStyles[tone]}`} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-center justify-between">
        <span className="metric-icon"><Icon size={16} /></span>
        {trend && (trend === 'up' ? <ArrowUpRight size={15} className="text-rose-400" /> : <ArrowDownRight size={15} className="text-emerald-400" />)}
      </div>
      <p className="mt-4 metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-sub">{sub}</p>
    </motion.div>
  );
}

function StatusPill({ risk }: { risk: Asset['risk'] }) {
  const style = risk === 'High' ? 'status-high' : risk === 'Medium' ? 'status-medium' : 'status-low';
  return <span className={`status-pill ${style}`} data-testid={`status-risk-${risk.toLowerCase()}`}><span className="status-dot" />{risk} risk</span>;
}

function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [selectedAssetId, setSelectedAssetId] = useState('haul-01');
  const [range, setRange] = useState('7d');
  const [sensitivity, setSensitivity] = useState(62);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [events, setEvents] = useState(eventSeed);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('just now');
  const [isStreaming, setIsStreaming] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? assets[0];
  const series = useMemo(() => makeSeries(range, refreshing ? 2 : 0), [range, refreshing]);
  const filteredAssets = assets.filter((asset) => `${asset.name} ${asset.type} ${asset.location}`.toLowerCase().includes(search.toLowerCase()));

  const refreshData = () => {
    setRefreshing(true);
    setLastRefresh('updating...');
    window.setTimeout(() => {
      setRefreshing(false);
      setLastRefresh('just now');
      setToast('Live readings synchronized');
      window.setTimeout(() => setToast(''), 2600);
    }, 700);
  };

  const chooseAsset = (id: string) => {
    setSelectedAssetId(id);
    setDetailOpen(true);
  };

  const scheduleMaintenance = (event: Omit<Event, 'id' | 'status'>) => {
    setEvents((current) => [{ ...event, id: Date.now(), status: 'Scheduled' }, ...current]);
    setScheduleOpen(false);
    setToast('Maintenance action scheduled');
    window.setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="min-h-[100dvh] bg-[#091419] text-[#dce6e5] selection:bg-[#c6a35d]/30">
      <AnimatePresence>
        {isSidebarOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="mobile-scrim" aria-label="Close navigation" data-testid="button-close-navigation" />}
      </AnimatePresence>
      <aside className={`app-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span className="brand-mark-line" /><span className="brand-mark-line short" /><span className="brand-mark-line" /></div>
          <div><p className="brand-name">Mine<span>Sense</span></p><p className="brand-caption">PREDICTIVE MAINTENANCE</p></div>
          <button className="mobile-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu" data-testid="button-mobile-close"><X size={18} /></button>
        </div>
        <div className="site-selector"><div className="site-pulse" /><div><p>PNG Operations</p><span>Ok Tedi · Site 04</span></div><ChevronDown size={14} /></div>
        <p className="nav-kicker">WORKSPACE</p>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => { setActiveNav(label); setIsSidebarOpen(false); }} className={`nav-item ${activeNav === label ? 'nav-item-active' : ''}`} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
              <Icon size={17} strokeWidth={activeNav === label ? 2.4 : 1.8} /><span>{label}</span>{label === 'Fleet' && <span className="nav-count">04</span>}
            </button>
          ))}
        </nav>
        <p className="nav-kicker mt-8">OPERATIONS</p>
        <button className="nav-item" onClick={() => setScheduleOpen(true)} data-testid="button-schedule-sidebar"><CalendarClock size={17} /><span>Schedule work</span><span className="nav-plus">+</span></button>
        <button className="nav-item" onClick={() => setToast('Alert configuration is ready for review')} data-testid="button-alerts-sidebar"><Bell size={17} /><span>Alert rules</span><span className="alert-count">3</span></button>
        <div className="sidebar-foot">
          <div className="model-status"><span className="status-dot" /><div><p>Model online</p><span>v2.4.1 · recalculated 8m ago</span></div></div>
          <div className="operator-card"><div className="operator-avatar">KM</div><div><p>Kila M.</p><span>Maintenance lead</span></div><MoreHorizontal size={16} /></div>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" data-testid="button-mobile-menu"><Menu size={20} /></button>
          <div className="breadcrumbs"><span className="crumb-muted">Operations</span><ChevronRight size={14} /><span>{activeNav}</span></div>
          <div className="topbar-actions">
            <div className={`stream-status ${isStreaming ? 'stream-live' : 'stream-paused'}`}><span className="stream-dot" />{isStreaming ? 'Live telemetry' : 'Stream paused'}</div>
            <button className="icon-button" onClick={() => setIsStreaming((value) => !value)} aria-label={isStreaming ? 'Pause telemetry' : 'Resume telemetry'} data-testid="button-toggle-stream">{isStreaming ? <Pause size={16} /> : <Play size={16} />}</button>
            <button className="icon-button notification-button" onClick={() => setToast('No new critical alerts')} aria-label="View alerts" data-testid="button-notifications"><Bell size={17} /><span /></button>
            <button className="help-button" onClick={() => setToast('MineSense support is available on the operations channel')} data-testid="button-help"><CircleHelp size={16} /> Help</button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-rule" /> CONTROL ROOM / 14 SEP 2026 · 10:42 POM</div>
              <h1>{activeNav === 'Overview' ? 'Operational overview' : activeNav}</h1>
              <p>{activeNav === 'Overview' ? 'Translate the latest machine signals into your next maintenance decision.' : activeNav === 'Fleet' ? 'A live view of equipment health across Ok Tedi operations.' : activeNav === 'Maintenance' ? 'Planned interventions and service history, in one shift-ready view.' : 'Inspect the telemetry behind every model decision.'}</p>
            </div>
            <div className="intro-actions">
              <span className="refresh-label"><span className="tiny-live-dot" />Updated {lastRefresh}</span>
              <button className={`outline-button ${refreshing ? 'is-refreshing' : ''}`} onClick={refreshData} data-testid="button-refresh-data"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh data</button>
              <button className="primary-button" onClick={() => setScheduleOpen(true)} data-testid="button-schedule-maintenance"><CalendarDays size={15} /> Schedule maintenance</button>
            </div>
          </section>

          {activeNav === 'Overview' && <Overview selectedAsset={selectedAsset} selectedAssetId={selectedAssetId} chooseAsset={chooseAsset} range={range} setRange={setRange} sensitivity={sensitivity} setSensitivity={setSensitivity} series={series} onSchedule={() => setScheduleOpen(true)} />}
          {activeNav === 'Fleet' && <FleetView assets={filteredAssets} search={search} setSearch={setSearch} chooseAsset={chooseAsset} />}
          {activeNav === 'Maintenance' && <MaintenanceView events={events} onSchedule={() => setScheduleOpen(true)} />}
          {activeNav === 'Data Explorer' && <DataExplorer series={series} selectedAsset={selectedAsset} range={range} setRange={setRange} />}
        </div>
      </main>

      <AnimatePresence>
        {detailOpen && <AssetDetail asset={selectedAsset} onClose={() => setDetailOpen(false)} onSchedule={() => { setDetailOpen(false); setScheduleOpen(true); }} />}
        {scheduleOpen && <ScheduleModal asset={selectedAsset} onClose={() => setScheduleOpen(false)} onSubmit={scheduleMaintenance} />}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="toast-message" data-testid="status-toast"><Check size={16} />{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

function Overview({ selectedAsset, selectedAssetId, chooseAsset, range, setRange, sensitivity, setSensitivity, series, onSchedule }: { selectedAsset: Asset; selectedAssetId: string; chooseAsset: (id: string) => void; range: string; setRange: (range: string) => void; sensitivity: number; setSensitivity: (value: number) => void; series: ReturnType<typeof makeSeries>; onSchedule: () => void }) {
  return (
    <div className="space-y-5">
      <div className="metrics-grid">
        <MetricCard label="Fleet health" value="72 / 100" sub="↓ 3.6 pts from last week" tone="amber" icon={Gauge} trend="down" />
        <MetricCard label="At-risk assets" value="02" sub="1 critical · 1 watch" tone="red" icon={AlertTriangle} />
        <MetricCard label="Fleet uptime" value="92.4%" sub="+1.8% against target" tone="teal" icon={Zap} trend="up" />
        <MetricCard label="Avoided downtime" value="18.6h" sub="Estimated this month" tone="slate" icon={ShieldCheck} trend="up" />
      </div>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div><p className="panel-overline">SELECTED ASSET / SIGNAL TREND</p><h2>{selectedAsset.name}</h2><p className="panel-muted"><span className="signal-live-dot" />Vibration · bearing housing <span className="muted-divider">|</span> Last 7 days</p></div>
            <div className="segmented-control">{['24h', '7d', '30d'].map((item) => <button key={item} onClick={() => setRange(item)} className={range === item ? 'segment-active' : ''} data-testid={`button-range-${item}`}>{item}</button>)}</div>
          </div>
          <div className="chart-legend"><span><i className="legend-line amber-line" />Vibration <b>4.7 mm/s</b></span><span><i className="legend-line teal-line" />Expected band <b>2.8–4.2</b></span><span className="legend-warning"><AlertTriangle size={13} /> 2 anomalies detected</span></div>
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="vibrationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d5ad5b" stopOpacity={0.28} /><stop offset="100%" stopColor="#d5ad5b" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#25373c" vertical={false} /><XAxis dataKey="time" tick={{ fill: '#788b8c', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[2, 7]} tick={{ fill: '#788b8c', fontSize: 11 }} axisLine={false} tickLine={false} /><ChartTooltip contentStyle={{ background: '#12242a', border: '1px solid #31474a', borderRadius: 6, color: '#e4ece9', fontSize: 12 }} /><Area type="monotone" dataKey="vibration" stroke="#d5ad5b" strokeWidth={2.5} fill="url(#vibrationFill)" dot={{ r: 2, fill: '#d5ad5b', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#d5ad5b', stroke: '#17292d', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer><div className="threshold-line" style={{ top: '29%' }}><span>ALERT THRESHOLD 5.2</span></div></div>
          <div className="chart-foot"><span><Clock3 size={13} /> Sampled every 15 minutes</span><button onClick={() => chooseAsset(selectedAssetId)} data-testid="button-open-asset-chart">Inspect asset <ChevronRight size={14} /></button></div>
        </section>

        <section className="panel insight-panel">
          <div className="panel-heading"><div><p className="panel-overline">MODEL INSIGHT</p><h2>Intervention recommended</h2></div><span className="confidence-tag">91% confidence</span></div>
          <div className="risk-readout"><div className="risk-ring"><div><strong>74</strong><span>/ 100 risk</span></div></div><div><p className="risk-label">MEDIUM RISK</p><p className="risk-copy">Bearing vibration is trending above its learned operating band.</p></div></div>
          <div className="insight-callout"><div className="callout-icon"><Wrench size={16} /></div><div><strong>Service within 8–12 days</strong><p>Planned inspection now avoids an estimated <b>6.4h</b> of unplanned downtime.</p></div></div>
          <div className="contributors"><div className="contributors-title"><span>Top contributing signals</span><span>Impact</span></div><SignalBar label="Vibration RMS" value={78} color="amber" note="above baseline" /><SignalBar label="Oil condition" value={46} color="teal" note="stable" /><SignalBar label="Bearing temperature" value={32} color="slate" note="within band" /></div>
          <button className="panel-action" onClick={onSchedule} data-testid="button-schedule-insight"><CalendarClock size={15} /> Schedule recommended action <ChevronRight size={15} /></button>
        </section>
      </div>

      <div className="lower-grid">
        <section className="panel asset-panel">
          <div className="panel-heading"><div><p className="panel-overline">FLEET AT A GLANCE</p><h2>Equipment health</h2></div><button className="text-button" onClick={() => chooseAsset('crusher-02')} data-testid="button-view-fleet">View fleet <ChevronRight size={14} /></button></div>
          <div className="asset-list">{assets.map((asset) => <button key={asset.id} onClick={() => chooseAsset(asset.id)} className={`asset-row ${selectedAssetId === asset.id ? 'asset-row-active' : ''}`} data-testid={`asset-row-${asset.id}`}><div className="asset-ident"><div className={`asset-glyph ${asset.risk.toLowerCase()}`}><Truck size={17} /></div><div><strong>{asset.name}</strong><span>{asset.type} · {asset.location}</span></div></div><div className="asset-health"><div className="health-number">{asset.health}</div><div className="health-meter"><span style={{ width: `${asset.health}%` }} className={asset.health < 55 ? 'meter-red' : asset.health < 75 ? 'meter-amber' : 'meter-teal'} /></div></div><StatusPill risk={asset.risk} /><ChevronRight size={16} className="asset-chevron" /></button>)}</div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading"><div><p className="panel-overline">SHIFT LOG</p><h2>Recent activity</h2></div><button className="icon-button subtle" data-testid="button-activity-filter"><ListFilter size={16} /></button></div>
          <div className="activity-list"><ActivityItem icon={AlertTriangle} color="red" title="High temperature anomaly" detail="CR-02 · Primary crusher" time="12 min ago" /><ActivityItem icon={Wrench} color="amber" title="Inspection scheduled" detail="HD-07 · Vibration sensor" time="1h ago" /><ActivityItem icon={Radio} color="teal" title="Telemetry restored" detail="CV-01 · Conveyor drive" time="2h ago" /><ActivityItem icon={ShieldCheck} color="slate" title="Model recalculated" detail="Fleet-wide · v2.4.1" time="8h ago" /></div>
          <button className="panel-action muted-action" data-testid="button-view-activity">View all activity <ChevronRight size={15} /></button>
        </section>
      </div>

      <section className="panel controls-strip">
        <div className="controls-copy"><SlidersHorizontal size={17} /><div><strong>Model sensitivity</strong><span>Controls how early MineSense flags a deviation from normal.</span></div></div>
        <div className="sensitivity-control"><span>Conservative</span><input aria-label="Model sensitivity" data-testid="input-model-sensitivity" type="range" min="20" max="90" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} /><span>Proactive</span><strong>{sensitivity}%</strong></div>
      </section>
    </div>
  );
}

function SignalBar({ label, value, color, note }: { label: string; value: number; color: string; note: string }) {
  return <div className="signal-row"><div className="flex items-center justify-between"><span>{label}</span><span className={`signal-note ${color}`}>{note}</span></div><div className="signal-track"><span className={`signal-fill ${color}`} style={{ width: `${value}%` }} /></div></div>;
}

function ActivityItem({ icon: Icon, color, title, detail, time }: { icon: typeof Activity; color: string; title: string; detail: string; time: string }) {
  return <div className="activity-item"><div className={`activity-icon ${color}`}><Icon size={15} /></div><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>;
}

function FleetView({ assets: shownAssets, search, setSearch, chooseAsset }: { assets: Asset[]; search: string; setSearch: (value: string) => void; chooseAsset: (id: string) => void }) {
  return <section className="panel fleet-view"><div className="fleet-toolbar"><div><p className="panel-overline">ASSET REGISTER / 04 UNITS</p><h2>Fleet health register</h2><p className="panel-muted">Select an asset to open its live condition profile.</p></div><div className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search equipment..." data-testid="input-search-assets" /></div></div><div className="fleet-table-wrap"><table className="fleet-table"><thead><tr><th>Asset</th><th>Health</th><th>Risk</th><th>Uptime</th><th>Next service</th><th>Operating hours</th><th /></tr></thead><tbody>{shownAssets.map((asset) => <tr key={asset.id} onClick={() => chooseAsset(asset.id)} data-testid={`fleet-table-row-${asset.id}`}><td><div className="asset-ident"><div className={`asset-glyph ${asset.risk.toLowerCase()}`}><Truck size={16} /></div><div><strong>{asset.name}</strong><span>{asset.type} · {asset.location}</span></div></div></td><td><div className="table-health"><b>{asset.health}</b><div className="health-meter"><span style={{ width: `${asset.health}%` }} className={asset.health < 55 ? 'meter-red' : asset.health < 75 ? 'meter-amber' : 'meter-teal'} /></div></div></td><td><StatusPill risk={asset.risk} /></td><td className="mono-value">{asset.uptime}</td><td className="service-date"><CalendarDays size={13} />{asset.nextService}</td><td className="mono-value">{asset.operatingHours.toLocaleString()} h</td><td><ChevronRight size={16} /></td></tr>)}</tbody></table>{shownAssets.length === 0 && <div className="empty-state"><Search size={22} /><strong>No matching assets</strong><span>Try a different equipment name or location.</span></div>}</div></section>;
}

function MaintenanceView({ events, onSchedule }: { events: Event[]; onSchedule: () => void }) {
  return <div className="space-y-5"><div className="maintenance-summary"><MetricCard label="Due this week" value="02" sub="Both have model recommendations" tone="red" icon={CalendarClock} /><MetricCard label="Scheduled hours" value="06.0h" sub="Across 2 planned jobs" tone="amber" icon={Clock3} /><MetricCard label="Completed this month" value="14" sub="92% on-time completion" tone="teal" icon={Check} /></div><section className="panel maintenance-panel"><div className="fleet-toolbar"><div><p className="panel-overline">WORK PLAN / SEPTEMBER 2026</p><h2>Maintenance schedule</h2><p className="panel-muted">Planned work is ordered by model urgency and crew availability.</p></div><button className="primary-button" onClick={onSchedule} data-testid="button-schedule-maintenance-view"><CalendarDays size={15} /> Add work order</button></div><div className="maintenance-list">{events.map((event) => <div className="maintenance-row" key={event.id} data-testid={`maintenance-event-${event.id}`}><div className={`event-status ${event.status.toLowerCase().replace(' ', '-')}`}><CalendarClock size={16} /></div><div className="maintenance-main"><strong>{event.type}</strong><span>{event.asset}</span></div><div className="maintenance-date"><span>{event.date}</span><small>{event.duration}</small></div><span className={`event-pill ${event.status.toLowerCase().replace(' ', '-')}`}>{event.status}</span><button className="icon-button subtle" onClick={onSchedule} aria-label={`Edit ${event.type}`} data-testid={`button-edit-event-${event.id}`}><MoreHorizontal size={16} /></button></div>)}</div></section></div>;
}

function DataExplorer({ series, selectedAsset, range, setRange }: { series: ReturnType<typeof makeSeries>; selectedAsset: Asset; range: string; setRange: (value: string) => void }) {
  return <div className="space-y-5"><section className="panel explorer-panel"><div className="fleet-toolbar"><div><p className="panel-overline">RAW TELEMETRY / {selectedAsset.id.toUpperCase()}</p><h2>Data explorer</h2><p className="panel-muted">Inspect sensor channels before they become an intervention.</p></div><div className="segmented-control">{['24h', '7d', '30d'].map((item) => <button key={item} onClick={() => setRange(item)} className={range === item ? 'segment-active' : ''} data-testid={`button-explorer-range-${item}`}>{item}</button>)}</div></div><div className="explorer-charts"><div className="mini-chart"><div><span>Temperature</span><b>84.2 °C</b></div><ResponsiveContainer width="100%" height={170}><LineChart data={series}><CartesianGrid stroke="#25373c" vertical={false} /><XAxis dataKey="time" hide /><YAxis hide domain={['dataMin - 5', 'dataMax + 5']} /><Line dataKey="temperature" stroke="#d5ad5b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer><small>Operating band 70–92 °C</small></div><div className="mini-chart"><div><span>Hydraulic pressure</span><b>282 bar</b></div><ResponsiveContainer width="100%" height={170}><LineChart data={series}><CartesianGrid stroke="#25373c" vertical={false} /><XAxis dataKey="time" hide /><YAxis hide domain={['dataMin - 10', 'dataMax + 10']} /><Line dataKey="pressure" stroke="#64b8a8" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer><small>Operating band 260–310 bar</small></div><div className="mini-chart"><div><span>Risk trajectory</span><b>42 / 100</b></div><ResponsiveContainer width="100%" height={170}><BarChart data={series}><CartesianGrid stroke="#25373c" vertical={false} /><XAxis dataKey="time" hide /><YAxis hide /><Bar dataKey="risk" fill="#a16c73" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer><small>Model output · sensitivity adjusted</small></div></div></section><section className="panel readings-panel"><div className="panel-heading"><div><p className="panel-overline">LATEST SAMPLE / 10:42:15 POM</p><h2>Sensor readings</h2></div><span className="live-badge"><Radio size={13} /> Live</span></div><div className="reading-grid"><Reading label="Temperature" value="84.2" unit="°C" status="Normal" icon={Thermometer} /><Reading label="Vibration RMS" value="4.7" unit="mm/s" status="Watch" icon={Activity} /><Reading label="Oil condition" value="91" unit="%" status="Good" icon={Gauge} /><Reading label="Hydraulic pressure" value="282" unit="bar" status="Normal" icon={Zap} /></div></section></div>;
}

function Reading({ label, value, unit, status, icon: Icon }: { label: string; value: string; unit: string; status: string; icon: typeof Activity }) {
  return <div className="reading-card"><div className="reading-top"><span className="reading-icon"><Icon size={16} /></span><span className={status === 'Watch' ? 'reading-watch' : 'reading-good'}>{status}</span></div><p>{label}</p><strong>{value}<small>{unit}</small></strong></div>;
}

function AssetDetail({ asset, onClose, onSchedule }: { asset: Asset; onClose: () => void; onSchedule: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay"><motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="detail-drawer"><div className="drawer-head"><div><p className="panel-overline">ASSET PROFILE</p><h2>{asset.name}</h2><p>{asset.type} · {asset.location}</p></div><button className="icon-button" onClick={onClose} aria-label="Close asset details" data-testid="button-close-asset-detail"><X size={18} /></button></div><div className="drawer-health"><div className="large-health"><strong>{asset.health}</strong><span>health score</span></div><StatusPill risk={asset.risk} /><div className="drawer-meter"><span style={{ width: `${asset.health}%` }} /></div></div><div className="detail-section"><p className="panel-overline">OPERATING SNAPSHOT</p><div className="detail-stat-grid"><div><span>Uptime</span><strong>{asset.uptime}</strong></div><div><span>Operating hours</span><strong>{asset.operatingHours.toLocaleString()} h</strong></div><div><span>Last service</span><strong>{asset.lastService}</strong></div><div><span>Next service</span><strong>{asset.nextService}</strong></div></div></div><div className="detail-section"><p className="panel-overline">WHY IT IS FLAGGED</p><div className="drawer-reason"><AlertTriangle size={17} /><p><b>{asset.signal}</b> is contributing most to the current risk score. The model sees a persistent deviation from this asset’s learned baseline over the last 36 hours.</p></div></div><div className="drawer-actions"><button className="outline-button" onClick={onClose} data-testid="button-close-detail">Close profile</button><button className="primary-button" onClick={onSchedule} data-testid="button-schedule-asset-detail"><CalendarClock size={15} /> Schedule service</button></div></motion.aside></motion.div>;
}

function ScheduleModal({ asset, onClose, onSubmit }: { asset: Asset; onClose: () => void; onSubmit: (event: Omit<Event, 'id' | 'status'>) => void }) {
  const [type, setType] = useState('Bearing inspection');
  const [date, setDate] = useState('18 Sep · 06:00');
  const [duration, setDuration] = useState('3h');
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop"><motion.div initial={{ y: 15, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} className="schedule-modal"><div className="modal-head"><div><p className="panel-overline">NEW WORK ORDER</p><h2>Schedule maintenance</h2><p>Create an intervention from the model recommendation.</p></div><button className="icon-button" onClick={onClose} aria-label="Close schedule dialog" data-testid="button-close-schedule"><X size={18} /></button></div><div className="recommendation-banner"><div className="callout-icon"><Wrench size={16} /></div><div><span>RECOMMENDED FOR</span><strong>{asset.name}</strong><p>Service within 8–12 days · {asset.signal} is above baseline</p></div></div><label className="form-label">Work type<select value={type} onChange={(event) => setType(event.target.value)} data-testid="select-work-type"><option>Bearing inspection</option><option>Vibration sensor check</option><option>Oil sampling</option><option>Preventive service</option></select></label><div className="form-row"><label className="form-label">Planned start<input value={date} onChange={(event) => setDate(event.target.value)} data-testid="input-work-date" /></label><label className="form-label">Duration<select value={duration} onChange={(event) => setDuration(event.target.value)} data-testid="select-work-duration"><option>1h</option><option>2h</option><option>3h</option><option>4h</option><option>6h</option></select></label></div><div className="modal-foot"><button className="outline-button" onClick={onClose} data-testid="button-cancel-schedule">Cancel</button><button className="primary-button" onClick={() => onSubmit({ asset: asset.name, type, date, duration })} data-testid="button-confirm-schedule"><Check size={15} /> Confirm work order</button></div></motion.div></motion.div>;
}

export default App;
