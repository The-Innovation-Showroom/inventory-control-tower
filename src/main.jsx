import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LayoutDashboard,Search,Users,SlidersHorizontal,Sparkles,Calculator,FileDown,ShieldCheck,TriangleAlert,ArrowRightLeft,Factory,Boxes,TrendingUp,CheckCircle2,ChevronRight,Download,Mail,Clock3,CircleDollarSign,Activity,Info,Globe2,PackageCheck,BarChart3,Gauge} from 'lucide-react';
import './styles.css';

const TODAY=new Date('2026-08-12T00:00:00');
const riskWindowDays=120;
const fmtUSD=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const fmtNum=new Intl.NumberFormat('en-US');
const money=n=>fmtUSD.format(Math.round(n||0));
const num=n=>fmtNum.format(Math.round(n||0));
const pct=n=>`${Math.round((n||0)*10)/10}%`;
const daysTo=d=>Math.ceil((new Date(`${d}T00:00:00`)-TODAY)/86400000);
const colors=['#0f766e','#2563eb','#f59e0b','#ef4444','#7c3aed','#06b6d4','#94a3b8'];

const sites=[
 {id:'DET',name:'Detroit Assembly Plant',country:'United States',region:'North America',type:'Plant'},
 {id:'CLE',name:'Cleveland Components Plant',country:'United States',region:'North America',type:'Plant'},
 {id:'DAL',name:'Dallas Distribution Center',country:'United States',region:'North America',type:'Distribution Center'},
 {id:'MTY',name:'Monterrey Manufacturing Plant',country:'Mexico',region:'North America',type:'Plant'},
 {id:'HAM',name:'Hamburg Assembly Plant',country:'Germany',region:'Europe',type:'Plant'},
 {id:'BRN',name:'Brno Manufacturing Plant',country:'Czech Republic',region:'Europe',type:'Plant'},
 {id:'RTM',name:'Rotterdam Distribution Hub',country:'Netherlands',region:'Europe',type:'Distribution Center'},
 {id:'PUN',name:'Pune Manufacturing Plant',country:'India',region:'Asia Pacific',type:'Plant'},
 {id:'CHE',name:'Chennai Assembly Plant',country:'India',region:'Asia Pacific',type:'Plant'},
];
const siteById=Object.fromEntries(sites.map(s=>[s.id,s]));

const products=[
 {sku:'BRG-X18',name:'Precision Bearing Set',family:'Motion Components',unitValue:2850,shelfLifeControlled:true},
 {sku:'SEAL-12',name:'Industrial Seal Kit',family:'Fluid Systems',unitValue:1180,shelfLifeControlled:true},
 {sku:'SRV-2L',name:'Servo Actuator Module',family:'Automation Components',unitValue:3420,shelfLifeControlled:true},
 {sku:'CVA-90',name:'Control Valve Assembly',family:'Flow Control',unitValue:2140,shelfLifeControlled:true},
 {sku:'DRV-44',name:'Variable Drive Module',family:'Automation Components',unitValue:3980,shelfLifeControlled:true},
];
const productBySku=Object.fromEntries(products.map(p=>[p.sku,p]));

const inventoryRaw=[
 {site:'DET',sku:'BRG-X18',batch:'BR-24018',expiry:'2026-10-18',onHand:128,monthlyUsage:16,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'CLE',sku:'BRG-X18',batch:'BR-24021',expiry:'2027-08-30',onHand:42,monthlyUsage:24,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'DAL',sku:'BRG-X18',batch:'BR-24022',expiry:'2027-11-15',onHand:95,monthlyUsage:8,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'MTY',sku:'BRG-X18',batch:'BR-24024',expiry:'2027-12-10',onHand:12,monthlyUsage:34,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'HAM',sku:'SEAL-12',batch:'SK-7781',expiry:'2026-10-30',onHand:210,monthlyUsage:28,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'RTM',sku:'SEAL-12',batch:'SK-7784',expiry:'2026-11-20',onHand:155,monthlyUsage:18,safetyDays:30,owner:'3PL',quality:'Clear',transfer:'Conditional'},
 {site:'BRN',sku:'SEAL-12',batch:'SK-7790',expiry:'2027-09-30',onHand:28,monthlyUsage:38,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'PUN',sku:'SRV-2L',batch:'SA-9923',expiry:'2026-12-01',onHand:118,monthlyUsage:14,safetyDays:45,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'CHE',sku:'SRV-2L',batch:'SA-9931',expiry:'2027-10-01',onHand:18,monthlyUsage:30,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'CLE',sku:'CVA-90',batch:'CV-8802',expiry:'2026-11-05',onHand:96,monthlyUsage:10,safetyDays:30,owner:'Internal',quality:'Quality Hold',transfer:'No'},
 {site:'DAL',sku:'CVA-90',batch:'CV-8811',expiry:'2027-09-05',onHand:22,monthlyUsage:25,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'HAM',sku:'DRV-44',batch:'DV-4407',expiry:'2026-12-08',onHand:74,monthlyUsage:9,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
 {site:'BRN',sku:'DRV-44',batch:'DV-4412',expiry:'2027-10-15',onHand:14,monthlyUsage:22,safetyDays:30,owner:'Internal',quality:'Clear',transfer:'Yes'},
];

const demandRaw=[
 {site:'MTY',sku:'BRG-X18',qty60:82,confidence:.91,source:'Firm production orders + MRP shortage',urgency:'High'},
 {site:'CLE',sku:'BRG-X18',qty60:38,confidence:.83,source:'Production plan + low days of supply',urgency:'Medium'},
 {site:'BRN',sku:'SEAL-12',qty60:76,confidence:.88,source:'Confirmed production plan',urgency:'High'},
 {site:'HAM',sku:'SEAL-12',qty60:22,confidence:.70,source:'Consumption forecast',urgency:'Medium'},
 {site:'CHE',sku:'SRV-2L',qty60:66,confidence:.90,source:'Line schedule + open requirements',urgency:'High'},
 {site:'DAL',sku:'CVA-90',qty60:44,confidence:.86,source:'Service demand + replenishment signal',urgency:'High'},
 {site:'BRN',sku:'DRV-44',qty60:48,confidence:.87,source:'Backlog + production plan',urgency:'High'},
];

const laneCost=(from,to,owner,qty)=>{
 const a=siteById[from],b=siteById[to];
 let fixed=a.region===b.region?2200:6500;
 let perUnit=a.region===b.region?18:42;
 if(owner==='3PL') fixed+=1800;
 return Math.round(fixed+perUnit*qty);
};
const laneDays=(from,to)=>siteById[from].region===siteById[to].region?4:12;

const inventory=inventoryRaw.map(r=>{
 const p=productBySku[r.sku],s=siteById[r.site],daysRemaining=daysTo(r.expiry);
 const consumptionThroughRiskWindow=r.monthlyUsage*(Math.min(Math.max(daysRemaining,0),riskWindowDays)/30);
 const safetyStock=r.monthlyUsage*(r.safetyDays/30);
 const required=Math.ceil(consumptionThroughRiskWindow+safetyStock);
 const excessUnits=daysRemaining<=riskWindowDays?Math.max(0,r.onHand-required):0;
 const valueAtRisk=excessUnits*p.unitValue;
 const daysOfSupply=r.monthlyUsage?Math.round(r.onHand/r.monthlyUsage*30):999;
 const eligible=r.quality==='Clear'&&r.transfer!=='No'&&excessUnits>0;
 const risk=r.quality!=='Clear'?'Blocked':valueAtRisk>=250000&&daysRemaining<=90?'Critical':valueAtRisk>=150000?'High':valueAtRisk>=50000?'Medium':'Low';
 return {...r,productName:p.name,family:p.family,unitValue:p.unitValue,siteName:s.name,country:s.country,region:s.region,siteType:s.type,daysRemaining,required,excessUnits,valueAtRisk,daysOfSupply,eligible};
});

const demandState=demandRaw.map(d=>({...d,remaining:d.qty60}));
const allocations=[];
[...inventory].filter(x=>x.eligible).sort((a,b)=>a.daysRemaining-b.daysRemaining||b.valueAtRisk-a.valueAtRisk).forEach(src=>{
 let remaining=src.excessUnits;
 const matches=demandState.filter(d=>d.sku===src.sku&&d.site!==src.site&&d.remaining>0)
   .sort((a,b)=>(b.urgency==='High')-(a.urgency==='High')||b.confidence-a.confidence);
 for(const d of matches){
   if(remaining<=0) break;
   const qty=Math.min(remaining,d.remaining);
   const logistics=laneCost(src.site,d.site,src.owner,qty);
   const gross=qty*src.unitValue;
   const net=gross-logistics;
   const confidence=Math.round((d.confidence*100-(src.owner==='3PL'?4:0)-(siteById[src.site].region!==siteById[d.site].region?3:0))*10)/10;
   const leadDays=laneDays(src.site,d.site);
   const executable=src.daysRemaining>leadDays+14 && net>0;
   if(executable){
     allocations.push({
       id:`${src.batch}-${d.site}`,
       sourceSite:src.site,
       destSite:d.site,
       from:src.siteName,
       to:siteById[d.site].name,
       sku:src.sku,
       productName:src.productName,
       batch:src.batch,
       qty,
       gross,
       logistics,
       net,
       confidence,
       leadDays,
       sourceDaysRemaining:src.daysRemaining,
       priority:net>=150000&&confidence>=80?'High':net>=60000?'Medium':'Low',
       reason:`${src.siteName} has ${num(src.excessUnits)} excess units inside the ${riskWindowDays}-day risk horizon; ${siteById[d.site].name} has ${num(d.qty60)} units of forecast 60-day demand.`
     });
     remaining-=qty;
     d.remaining-=qty;
   }
 }
});
allocations.sort((a,b)=>b.net-a.net||b.confidence-a.confidence);

const metrics={
 totalInventoryValue:inventory.reduce((s,x)=>s+x.onHand*x.unitValue,0),
 valueAtRisk:inventory.reduce((s,x)=>s+x.valueAtRisk,0),
 recoverableGross:allocations.reduce((s,x)=>s+x.gross,0),
 logistics:allocations.reduce((s,x)=>s+x.logistics,0),
 recoverableNet:allocations.reduce((s,x)=>s+x.net,0),
 blockedValue:inventory.filter(x=>x.quality!=='Clear').reduce((s,x)=>s+x.onHand*x.unitValue,0),
 blockedPositions:inventory.filter(x=>x.risk==='Blocked').length,
 recommendations:allocations.length,
};
metrics.recoveryRate=metrics.valueAtRisk?metrics.recoverableNet/metrics.valueAtRisk*100:0;

const regionRiskData=Object.entries(inventory.reduce((a,x)=>(a[x.region]=(a[x.region]||0)+x.valueAtRisk,a),{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
const siteExposureData=Object.entries(inventory.reduce((a,x)=>{a[x.siteName]=(a[x.siteName]||0)+x.valueAtRisk;return a;},{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,6);
const familyExposureData=Object.entries(inventory.reduce((a,x)=>{a[x.family]=(a[x.family]||0)+x.valueAtRisk;return a;},{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
const statusValueData=['Critical','High','Medium','Low','Blocked'].map(label=>({label,value:label==='Blocked'?inventory.filter(x=>x.risk===label).reduce((s,x)=>s+x.onHand*x.unitValue,0):inventory.filter(x=>x.risk===label).reduce((s,x)=>s+x.valueAtRisk,0)})).filter(x=>x.value>0);
const horizonData=[
 {label:'0–30 days',min:0,max:30},
 {label:'31–60 days',min:31,max:60},
 {label:'61–90 days',min:61,max:90},
 {label:'91–120 days',min:91,max:120},
].map(b=>({label:b.label,value:inventory.filter(x=>x.daysRemaining>=b.min&&x.daysRemaining<=b.max).reduce((s,x)=>s+x.valueAtRisk,0)}));
const topFlows=allocations.slice(0,6).map(r=>({label:`${r.sourceSite} → ${r.destSite}`,value:r.net,qty:r.qty,sub:`${num(r.qty)} units · ${money(r.net)}`}));

function Badge({v}){return <span className={`badge ${String(v).toLowerCase().replaceAll(' ','-')}`}>{v}</span>}
function InfoHint({text}){return <span className="infoHint" tabIndex="0"><Info size={13}/><em>{text}</em></span>}
function SectionTitle({title,text,info}){return <div><h2>{title} {info&&<InfoHint text={info}/>}</h2><p>{text}</p></div>}
function KPI({label,value,sub,icon,tone='default'}){return <div className={`kpi ${tone}`}><div className="kpiTop"><span>{label}</span>{icon}</div><div className="kpiVal">{value}</div><div className="muted small">{sub}</div></div>}
function Table({rows,cols,onRow}){return <div className="tableWrap"><table><thead><tr>{cols.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.id||r.batch||i} onClick={()=>onRow?.(r)} className={onRow?'clickable':''}>{cols.map(c=><td key={c.key}>{c.render?c.render(r):r[c.key]}</td>)}</tr>)}</tbody></table></div>}
function BarList({data,formatter=money}){const max=Math.max(...data.map(x=>x.value),1);return <div className="barList">{data.map((d,i)=><div key={d.label} className="barItem"><div className="barMeta"><span>{d.label}</span><b>{formatter(d.value)}</b></div><div className="barTrack"><i style={{width:`${d.value/max*100}%`,background:colors[i%colors.length]}}/></div></div>)}</div>}
function HeatGrid({data}){const max=Math.max(...data.map(x=>x.value),1);return <div className="heatGrid">{data.map(d=><div key={d.label} className="heatCell" style={{background:`rgba(23,103,155,${0.12+(d.value/max)*0.55})`}}><span>{d.label}</span><b>{money(d.value)}</b></div>)}</div>}
function WaterfallCard(){const bridge=[{label:'Value at risk',value:metrics.valueAtRisk,kind:'plus'},{label:'Executable gross',value:metrics.recoverableGross,kind:'plus'},{label:'Logistics',value:metrics.logistics,kind:'minus'},{label:'Net protected',value:metrics.recoverableNet,kind:'total'}];const max=Math.max(...bridge.map(x=>x.value),1);return <div className="chartCard"><div className="chartTitle"><span className="miniTitle">Value bridge</span><InfoHint text="Shows how the network moves from identified exposure to gross recoverable value and then to net protected value after logistics."/></div><div className="waterfall">{bridge.map((b,i)=><div key={b.label} className={`wf ${b.kind}`}><div className="wfBarWrap"><div className="wfBar" style={{height:`${Math.max(16,b.value/max*150)}px`}}/></div><span>{b.label}</span><b>{money(b.value)}</b>{i<bridge.length-1&&<em>{b.kind==='minus'?'−':'+'}</em>}</div>)}</div><p className="chartNote">Every transfer recommendation deducts lane-level logistics, so the net figure shown here ties directly to the recommendation queue and ROI page.</p></div>}
function LaneList(){const max=Math.max(...topFlows.map(x=>x.value),1);return <div className="chartCard"><div className="chartTitle"><span className="miniTitle">Top transfer lanes</span><InfoHint text="Highest value-protecting moves recommended by the connected allocation logic."/></div><div className="laneList">{topFlows.map((l,i)=><div key={l.label} className="laneRow"><div className="laneMeta"><b>{l.label}</b><span>{l.sub}</span></div><div className="laneTrack"><i style={{width:`${l.value/max*100}%`,background:colors[i%colors.length]}}/></div></div>)}</div></div>}

const nav=[['Executive Overview',LayoutDashboard],['Global Search & Investigation',Search],['Persona Workspaces',Users],['Scenario Simulator',SlidersHorizontal],['AI Copilot',Sparkles],['ROI Calculator',Calculator],['Executive Export',FileDown]];
function App(){const[page,setPage]=useState('Executive Overview');return <div className="app"><aside><div className="sideBrand"><div className="sideIcon"><Factory size={20}/></div><div><b>Control Tower</b><span>Inventory decision intelligence</span></div></div><nav>{nav.map(([n,I])=><button key={n} onClick={()=>setPage(n)} className={page===n?'active':''}><I size={18}/><span>{n}</span></button>)}</nav><div className="sideBottom"><div className="sideNote">Konverge AI<span>Applied AI for enterprise operations</span></div></div></aside><main><header><div><div className="eyebrow">NETWORK INVENTORY INTELLIGENCE · SAMPLE DATA</div><h1>Inventory Control Tower</h1><p>A connected view of inventory exposure, demand signals, transfer feasibility and working-capital recovery across a multi-site manufacturing network.</p></div><div className="caseTag"><Globe2 size={14}/> 9 sites · 5 SKUs · 1 connected decision model</div></header>{page==='Executive Overview'&&<Overview setPage={setPage}/>} {page==='Global Search & Investigation'&&<Investigation/>}{page==='Persona Workspaces'&&<Personas/>}{page==='Scenario Simulator'&&<Scenario/>}{page==='AI Copilot'&&<Copilot/>}{page==='ROI Calculator'&&<ROI/>}{page==='Executive Export'&&<Export/>}<footer>Sample scenario for demonstration only · All values derive from the same inventory, demand, quality and logistics dataset.</footer></main></div>}

function Overview({setPage}){
 return <>
 <div className="kpis"><KPI label="Inventory Value" value={money(metrics.totalInventoryValue)} sub="Current on-hand value in the network" icon={<Boxes size={18}/>}/><KPI label="Value at Risk" value={money(metrics.valueAtRisk)} sub={`Excess inside ${riskWindowDays}-day risk horizon`} icon={<TriangleAlert size={18}/>} tone="warn"/><KPI label="Net Value Recoverable" value={money(metrics.recoverableNet)} sub={`${pct(metrics.recoveryRate)} of identified exposure`} icon={<TrendingUp size={18}/>} tone="good"/><KPI label="Blocked Inventory" value={money(metrics.blockedValue)} sub={`${metrics.blockedPositions} position restricted by quality`} icon={<ShieldCheck size={18}/>} tone="soft"/></div>
 <section><div className="sectionHead"><SectionTitle title="Decision summary" text="The system moves from exposure → demand → feasibility → quantified action." info="A quick business summary of the network problem, the size of the opportunity and what the system is recommending."/><button className="secondary fit" onClick={()=>setPage('Global Search & Investigation')}>Investigate inventory <ChevronRight size={16}/></button></div><div className="insights"><div><TriangleAlert/><b>{money(metrics.valueAtRisk)} exposed</b><p>{inventory.filter(x=>x.valueAtRisk>0).length} inventory positions contain excess units that may not be consumed locally inside the risk horizon.</p></div><div><ArrowRightLeft/><b>{metrics.recommendations} executable transfers</b><p>Demand is available elsewhere for the same SKU, and source quantities are allocated only once to avoid overstating recovery.</p></div><div><CircleDollarSign/><b>{money(metrics.logistics)} transfer cost</b><p>Net recoverable value already deducts lane-level logistics costs; gross inventory moved is {money(metrics.recoverableGross)}.</p></div></div></section>
 <section><div className="sectionHead"><SectionTitle title="Network dashboard" text="Executive visuals are all fed by the same underlying inventory, demand and lane logic." info="These visuals are meant to be scanned quickly. If a user wants detail, they can open investigation, scenario or ROI for the exact underlying records."/></div><div className="dashboardGrid"><div className="chartCard"><div className="chartTitle"><span className="miniTitle">Exposure by region</span><InfoHint text="Compares current value at risk across North America, Europe and Asia Pacific."/></div><BarList data={regionRiskData}/></div><div className="chartCard"><div className="chartTitle"><span className="miniTitle">Top sites by exposure</span><InfoHint text="The specific plants or hubs currently carrying the largest excess value within the risk window."/></div><BarList data={siteExposureData}/></div><div className="chartCard"><div className="chartTitle"><span className="miniTitle">Risk status mix</span><InfoHint text="Shows where the network exposure sits by severity and by blocked inventory."/></div><BarList data={statusValueData}/></div><div className="chartCard"><div className="chartTitle"><span className="miniTitle">Exposure by product family</span><InfoHint text="Useful for understanding whether the concentration of risk sits in automation, motion, flow or fluid-related inventory."/></div><BarList data={familyExposureData}/></div><LaneList/><WaterfallCard/><div className="chartCard spanWide"><div className="chartTitle"><span className="miniTitle">Exposure within the risk horizon</span><InfoHint text="Buckets value at risk by how soon the control or expiry date arrives. Earlier buckets generally require faster action."/></div><HeatGrid data={horizonData}/></div></div></section>
 <section><div className="sectionHead"><SectionTitle title="Top recommended actions" text="Ranked using net financial value, demand confidence and time-to-risk." info="Each action below is executable under the current sample rules and already reflects source, demand, timing and logistics logic."/></div><Table rows={allocations.slice(0,6)} cols={[{key:'from',label:'Source'},{key:'to',label:'Destination'},{key:'productName',label:'Item'},{key:'qty',label:'Transfer Qty',render:r=>num(r.qty)},{key:'net',label:'Net Value Protected',render:r=><b>{money(r.net)}</b>},{key:'confidence',label:'Demand Confidence',render:r=>pct(r.confidence)},{key:'leadDays',label:'Lead Time',render:r=>`${r.leadDays} days`},{key:'priority',label:'Priority',render:r=><Badge v={r.priority}/>} ]}/></section></>
}

function Investigation(){
 const[q,setQ]=useState('');const[selectedId,setSelectedId]=useState(inventory[0]?.batch);const filtered=inventory.filter(x=>`${x.siteName} ${x.country} ${x.sku} ${x.productName} ${x.family} ${x.batch} ${x.quality}`.toLowerCase().includes(q.toLowerCase()));const item=inventory.find(x=>x.batch===selectedId)||filtered[0]||inventory[0];const demandMatches=demandRaw.filter(d=>d.sku===item.sku&&d.site!==item.site).map(d=>({...d,siteName:siteById[d.site].name,country:siteById[d.site].country}));const moves=allocations.filter(a=>a.batch===item.batch);const horizonPct=Math.max(0,Math.min(100,item.daysRemaining/riskWindowDays*100));
 return <><section><div className="sectionHead"><SectionTitle title="Global Search & Investigation" text="Search a single inventory truth and inspect why a position is risky, blocked or transferable." info="Start here if you want to trace any KPI or recommendation back to the source inventory record."/></div><div className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search site, country, SKU, product, batch or quality status…"/></div><Table onRow={r=>setSelectedId(r.batch)} rows={filtered} cols={[{key:'siteName',label:'Site'},{key:'sku',label:'SKU'},{key:'batch',label:'Batch'},{key:'onHand',label:'On Hand',render:r=>num(r.onHand)},{key:'daysOfSupply',label:'Days Supply',render:r=>`${r.daysOfSupply}d`},{key:'daysRemaining',label:'Days Remaining',render:r=>`${r.daysRemaining}d`},{key:'excessUnits',label:'Excess',render:r=>num(r.excessUnits)},{key:'valueAtRisk',label:'Value at Risk',render:r=>money(r.valueAtRisk)},{key:'risk',label:'Status',render:r=><Badge v={r.risk}/>} ]}/></section><section><div className="sectionHead"><SectionTitle title={`${item.productName} · ${item.batch}`} text={`${item.siteName} · ${item.country} · ${item.sku}`} info="Once a row is selected, this page explains why that inventory is flagged and whether it can be actioned."/><Badge v={item.risk}/></div><div className="miniGrid"><div><span>On hand</span><b>{num(item.onHand)}</b></div><div><span>Local requirement</span><b>{num(item.required)}</b></div><div><span>Excess units</span><b>{num(item.excessUnits)}</b></div><div><span>Value at risk</span><b>{money(item.valueAtRisk)}</b></div></div><div className="detailGrid"><div className="card"><h3>Why this position is flagged</h3><p>Inside the next {Math.min(item.daysRemaining,riskWindowDays)} days, expected local consumption plus safety stock requires about <b>{num(item.required)} units</b>. Current on-hand is <b>{num(item.onHand)}</b>, leaving <b>{num(item.excessUnits)} excess units</b>.</p><p><b>Unit value:</b> {money(item.unitValue)} · <b>Expiry / control date:</b> {item.expiry} · <b>Quality:</b> {item.quality}</p><div className="timeline"><div className="timelineTop"><span>Risk clock</span><b>{item.daysRemaining} days remaining</b></div><div className="timelineTrack"><i style={{width:`${horizonPct}%`}}/></div></div></div><div className="card"><h3>Execution checks</h3><p><b>Ownership:</b> {item.owner}<br/><b>Transfer rule:</b> {item.transfer}<br/><b>Quality status:</b> {item.quality}<br/><b>Eligible for recommendation:</b> {item.eligible?'Yes':'No'}</p><div className="contextStrip"><span><Activity size={14}/> {item.daysOfSupply} days of supply</span><span><PackageCheck size={14}/> {item.transfer} transfer policy</span><span><Clock3 size={14}/> {item.daysRemaining} days to control date</span></div></div></div><h3>Demand signals for same SKU</h3>{demandMatches.length?<Table rows={demandMatches} cols={[{key:'siteName',label:'Demand Site'},{key:'country',label:'Country'},{key:'qty60',label:'60-Day Demand',render:r=>num(r.qty60)},{key:'confidence',label:'Confidence',render:r=>pct(r.confidence*100)},{key:'source',label:'Signal Source'},{key:'urgency',label:'Urgency',render:r=><Badge v={r.urgency}/>} ]}/>:<div className="empty">No demand signals are available for this SKU.</div>}<h3 className="mt">Allocated recommendation</h3>{moves.length?<Table rows={moves} cols={[{key:'to',label:'Destination'},{key:'qty',label:'Allocated Qty',render:r=>num(r.qty)},{key:'gross',label:'Gross Value',render:r=>money(r.gross)},{key:'logistics',label:'Logistics',render:r=>money(r.logistics)},{key:'net',label:'Net Protected',render:r=><b>{money(r.net)}</b>},{key:'leadDays',label:'Lead Time',render:r=>`${r.leadDays} days`} ]}/>:<div className="empty">No executable transfer recommendation for this batch. The reason may be quality restriction, insufficient excess, no demand, timing, or unfavorable economics.</div>}</section></>
}

function Personas(){
 const[p,setP]=useState('Supply Chain CXO');
 const views={
 'Supply Chain CXO':[{l:'Network value at risk',v:money(metrics.valueAtRisk)},{l:'Net value recoverable',v:money(metrics.recoverableNet)},{l:'Executable transfers',v:num(metrics.recommendations)},{l:'Recovery rate',v:pct(metrics.recoveryRate)}],
 'Plant / Operations Leader':[{l:'Sites in network',v:num(sites.filter(s=>s.type==='Plant').length)},{l:'Excess units',v:num(inventory.reduce((s,x)=>s+x.excessUnits,0))},{l:'Demand units matched',v:num(allocations.reduce((s,x)=>s+x.qty,0))},{l:'High-priority moves',v:num(allocations.filter(x=>x.priority==='High').length)}],
 'Finance Leader':[{l:'Inventory value',v:money(metrics.totalInventoryValue)},{l:'Gross value moved',v:money(metrics.recoverableGross)},{l:'Transfer cost',v:money(metrics.logistics)},{l:'Net value protected',v:money(metrics.recoverableNet)}],
 'Quality / Compliance':[{l:'Blocked positions',v:num(metrics.blockedPositions)},{l:'Blocked inventory value',v:money(metrics.blockedValue)},{l:'Eligible source positions',v:num(inventory.filter(x=>x.eligible).length)},{l:'Recommendations released',v:num(metrics.recommendations)}]
 };
 const notes={'Supply Chain CXO':'Prioritizes network economics, service protection and how quickly the business can convert exposure into action.','Plant / Operations Leader':'Focuses on availability, local requirements, excess movement and practical transfer execution at site level.','Finance Leader':'Looks at working capital protection, value bridge, logistics burden and how much of the exposure turns into net benefit.','Quality / Compliance':'Tracks restricted inventory, transfer gating rules and the operational impact of quality status on release decisions.'};
 return <section><div className="sectionHead"><SectionTitle title="Persona Workspaces" text="One governed dataset, translated into the KPIs and actions each function needs." info="The numbers stay the same underneath. Only the lens changes by role."/></div><div className="tabs">{Object.keys(views).map(x=><button key={x} className={p===x?'on':''} onClick={()=>setP(x)}>{x}</button>)}</div><h3>{p}</h3><p className="muted personaCopy">{notes[p]}</p><div className="personaGrid">{views[p].map(x=><div key={x.l}><span>{x.l}</span><b>{x.v}</b></div>)}</div><div className="detailGrid"><div className="card"><h3>Shared priority queue</h3><Table rows={allocations.slice(0,5)} cols={[{key:'from',label:'Source'},{key:'to',label:'Destination'},{key:'productName',label:'Item'},{key:'qty',label:'Qty',render:r=>num(r.qty)},{key:'net',label:'Net Impact',render:r=>money(r.net)},{key:'confidence',label:'Confidence',render:r=>pct(r.confidence)},{key:'priority',label:'Priority',render:r=><Badge v={r.priority}/>} ]}/></div><div className="card"><h3>Functional emphasis</h3><BarList data={p==='Finance Leader'?[{label:'Net protected',value:metrics.recoverableNet},{label:'Transfer cost',value:metrics.logistics},{label:'Blocked value',value:metrics.blockedValue}]:p==='Quality / Compliance'?[{label:'Blocked value',value:metrics.blockedValue},{label:'Clear inventory',value:metrics.totalInventoryValue-metrics.blockedValue},{label:'Eligible exposure',value:inventory.filter(x=>x.eligible).reduce((s,x)=>s+x.valueAtRisk,0)}]:p==='Plant / Operations Leader'?[{label:'Excess units',value:inventory.reduce((s,x)=>s+x.excessUnits,0)},{label:'Matched units',value:allocations.reduce((s,x)=>s+x.qty,0)},{label:'Plants',value:sites.filter(s=>s.type==='Plant').length}]:[{label:'Value at risk',value:metrics.valueAtRisk},{label:'Net recoverable',value:metrics.recoverableNet},{label:'Blocked inventory',value:metrics.blockedValue}]} formatter={v=>v<1000?num(v):money(v)}/></div></div></section>
}

function Scenario(){
 const[choice,setChoice]=useState(0);
 const base=allocations[choice]||allocations[0];
 const[qtyPct,setQtyPct]=useState(100);
 const[logisticsPct,setLogisticsPct]=useState(100);
 const[demandPct,setDemandPct]=useState(100);
 React.useEffect(()=>{setQtyPct(100);setLogisticsPct(100);setDemandPct(100)},[choice]);
 if(!base)return <section><div className="empty">No recommendations available in the sample data.</div></section>;
 const source=inventory.find(x=>x.batch===base.batch);
 const adjustedQty=Math.max(1,Math.min(base.qty,Math.round(base.qty*(qtyPct/100))));
 const gross=adjustedQty*source.unitValue;
 const logistics=Math.round(base.logistics*(adjustedQty/base.qty)*(logisticsPct/100));
 const adjustedConfidence=Math.max(50,Math.min(99,base.confidence*(demandPct/100)));
 const writeoff=gross*0.92;
 const options=[
  {name:'Redistribute to matched demand',financial:gross-logistics,service:Math.min(99,Math.round(90+adjustedConfidence/10)),risk:'Low',complexity:'Medium',explain:`Move ${num(adjustedQty)} units through the validated lane; includes ${money(logistics)} logistics cost.`},
  {name:'Do nothing',financial:-writeoff,service:70,risk:'High',complexity:'Low',explain:'Keep stock at source; modeled downside assumes most exposed units become write-off / obsolescence.'},
  {name:'Buy new at destination',financial:-(gross+logistics*.2),service:98,risk:'Low',complexity:'Low',explain:'Protect service but purchase inventory while excess remains elsewhere in the network.'},
  {name:'Split transfer + local consumption',financial:Math.round((gross-logistics)*0.78),service:Math.min(96,Math.round(84+adjustedConfidence/12)),risk:'Medium',complexity:'High',explain:'Move part of the excess and rely on accelerated local usage for the balance.'}
 ].map(s=>({...s,score:Math.max(0,Math.min(100,Math.round((s.financial>0?45:10)+s.service*.45-(s.risk==='High'?18:s.risk==='Medium'?8:0)-(s.complexity==='High'?8:s.complexity==='Medium'?3:0))))}));
 const best=[...options].sort((a,b)=>b.score-a.score)[0];
 const maxFin=Math.max(...options.map(x=>Math.abs(x.financial)),1);
 return <section><div className="sectionHead"><SectionTitle title="Scenario Simulator" text="Start from a real recommendation, then compare action paths across economics, service and execution risk." info="Use the sliders below to increase or decrease transfer quantity, logistics pressure and demand confidence. The scenario cards update from the same underlying recommendation."/></div><div className="formGrid"><label>Recommendation <InfoHint text="Choose which recommended move you want to stress test."/><select value={choice} onChange={e=>setChoice(+e.target.value)}>{allocations.map((r,i)=><option value={i} key={r.id}>{r.from} → {r.to} · {r.sku}</option>)}</select></label><label>Source batch<input readOnly value={base.batch}/></label><label>Modeled lane<input readOnly value={`${base.from} → ${base.to}`}/></label><label>Base quantity<input readOnly value={num(base.qty)}/></label><label>Base net value<input readOnly value={money(base.net)}/></label></div><div className="simControls"><div className="controlCard"><div className="sliderHead"><span>Transfer quantity</span><b>{adjustedQty} units</b></div><input type="range" min="40" max="100" value={qtyPct} onChange={e=>setQtyPct(+e.target.value)}/><div className="sliderScale"><span>Lower</span><span>Recommended</span></div></div><div className="controlCard"><div className="sliderHead"><span>Logistics sensitivity</span><b>{logisticsPct}%</b></div><input type="range" min="80" max="130" value={logisticsPct} onChange={e=>setLogisticsPct(+e.target.value)}/><div className="sliderScale"><span>Lower cost</span><span>Higher cost</span></div></div><div className="controlCard"><div className="sliderHead"><span>Demand confidence</span><b>{pct(adjustedConfidence)}</b></div><input type="range" min="80" max="110" value={demandPct} onChange={e=>setDemandPct(+e.target.value)}/><div className="sliderScale"><span>Lower</span><span>Higher</span></div></div></div><div className="recommend"><Gauge size={22}/><div><span>Best scenario</span><h3>{best.name}</h3><p>Best combined outcome across economics, service, execution risk and complexity.</p></div><b>{best.score}/100</b></div><div className="scenarioGrid">{options.map(s=><div key={s.name} className={`scenario ${s.name===best.name?'best':''}`}><div className="scenarioTop"><h3>{s.name}</h3><span>{s.score}</span></div><p>{s.explain}</p><div className="impactRow"><div className={`impactBar ${s.financial>=0?'positive':'negative'}`} style={{width:`${Math.max(6,Math.abs(s.financial)/maxFin*100)}%`}}/></div><div className="scenarioFacts"><span>Financial impact <b className={s.financial<0?'negative':''}>{money(s.financial)}</b></span><span>Service level <b>{s.service}%</b></span><span>Execution risk <b>{s.risk}</b></span><span>Complexity <b>{s.complexity}</b></span></div></div>)}</div><div className="detailGrid"><div className="card"><h3>What this simulator is doing</h3><p>Instead of showing disconnected examples, the simulator starts from one selected recommendation and applies your changes on top. This keeps the quantity, lane, economics and timing aligned.</p></div><div className="card"><h3>Current adjustment summary</h3><p><b>Quantity:</b> {num(adjustedQty)} units · <b>Modeled logistics:</b> {money(logistics)} · <b>Adjusted demand confidence:</b> {pct(adjustedConfidence)} · <b>Source timing window:</b> {source.daysRemaining} days remaining.</p></div></div></section>
}

function Copilot(){const[prompt,setPrompt]=useState('Where is the biggest avoidable inventory loss?');const[answer,setAnswer]=useState('');const qs=['Where is the biggest avoidable inventory loss?','Which transfer should we approve first?','What inventory is blocked and why?','How much working capital can we protect?','Which region has the most exposure?'];function ask(){const text=prompt.toLowerCase(),top=allocations[0],largest=[...inventory].sort((a,b)=>b.valueAtRisk-a.valueAtRisk)[0],regions=Object.entries(inventory.reduce((a,x)=>(a[x.region]=(a[x.region]||0)+x.valueAtRisk,a),{})).sort((a,b)=>b[1]-a[1]);let a;if(text.includes('blocked')){const b=inventory.filter(x=>x.risk==='Blocked');a=`${b.length} inventory position is blocked. ${b.map(x=>`${x.siteName}, ${x.sku} batch ${x.batch}, represents ${money(x.onHand*x.unitValue)} and is restricted because of ${x.quality.toLowerCase()}`).join('; ')}. It is excluded from transfer recommendations until released.`}else if(text.includes('working')||text.includes('protect')) a=`The network has ${money(metrics.valueAtRisk)} of identified value at risk. The current demand-matched plan can protect ${money(metrics.recoverableGross)} gross value. After ${money(metrics.logistics)} of modeled logistics cost, net value protected is ${money(metrics.recoverableNet)}, or ${pct(metrics.recoveryRate)} of the exposure.`;else if(text.includes('approve')||text.includes('first')) a=`Approve ${top.from} → ${top.to} first: ${num(top.qty)} units of ${top.sku} (${top.productName}), ${money(top.net)} net value protected, ${pct(top.confidence)} demand confidence and ${top.leadDays}-day modeled transfer lead time.`;else if(text.includes('region')) a=`${regions[0][0]} has the highest current exposure at ${money(regions[0][1])}, followed by ${regions[1][0]} at ${money(regions[1][1])}.`;else a=`The largest single inventory exposure is ${largest.siteName}, ${largest.sku} batch ${largest.batch}: ${num(largest.excessUnits)} excess units worth ${money(largest.valueAtRisk)} with ${largest.daysRemaining} days remaining. ${allocations.some(x=>x.batch===largest.batch)?'The system has identified an executable demand-matched transfer for part of this exposure.':'No executable transfer is currently allocated for this batch.'}`;setAnswer(a)}return <section><div className="sectionHead"><SectionTitle title="AI Copilot" text="Natural-language answers are grounded in the exact sample data used across the control tower." info="Try a suggested question or type your own. The answers are deterministic in this demo so the numbers always reconcile."/></div><div className="chips">{qs.map(x=><button key={x} onClick={()=>setPrompt(x)}>{x}</button>)}</div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)}/><button className="primary fit" onClick={ask}><Sparkles size={17}/> Analyze</button>{answer&&<div className="aiAnswer"><div><Sparkles/></div><p>{answer}</p></div>}<div className="note"><Info size={16}/> This deployed demo uses deterministic answers from the embedded dataset so all figures reconcile. In production, the same governed metrics can be exposed through an enterprise LLM and operational data connectors.</div></section>}

function ROI(){const[choice,setChoice]=useState(0);const rec=allocations[choice]||allocations[0];const[qty,setQty]=useState(rec?.qty||1);React.useEffect(()=>setQty(rec?.qty||1),[choice]);if(!rec)return null;const src=inventory.find(x=>x.batch===rec.batch);const maxQty=rec.qty;const q=Math.max(1,Math.min(qty,maxQty));const logistics=laneCost(rec.sourceSite,rec.destSite,src.owner,q);const gross=q*src.unitValue;const net=gross-logistics;const breakEven=Math.ceil(logistics/src.unitValue);const roi=logistics?net/logistics*100:0;const valuePerDay=net/Math.max(rec.leadDays,1);return <section><div className="sectionHead"><SectionTitle title="Redistribution ROI Calculator" text="Use a system recommendation as the starting point, then test a smaller transfer quantity without breaking the underlying economics." info="This page converts a selected recommendation into an ROI view, using the same unit value and lane cost logic as the rest of the system."/></div><div className="formGrid two"><label>Recommendation <InfoHint text="Select a recommended move to estimate economics at a different quantity."/><select value={choice} onChange={e=>setChoice(+e.target.value)}>{allocations.map((r,i)=><option value={i} key={r.id}>{r.from} → {r.to} · {r.sku}</option>)}</select></label><label>Transfer quantity (max {num(maxQty)})<input type="number" min="1" max={maxQty} value={qty} onChange={e=>setQty(+e.target.value)}/></label></div><div className="verdict good"><CheckCircle2/><div><span>Economic result</span><b>{net>0?'Positive transfer economics':'Review required'}</b></div></div><div className="kpis"><KPI label="Gross Inventory Value" value={money(gross)} sub={`${num(q)} units × ${money(src.unitValue)}`}/><KPI label="Modeled Logistics" value={money(logistics)} sub={`${rec.leadDays}-day lane estimate`}/><KPI label="Net Value Protected" value={money(net)} sub="Gross value less transfer cost"/><KPI label="Transfer ROI" value={`${roi.toFixed(0)}%`} sub={`${num(breakEven)} units to break even`}/></div><div className="detailGrid"><div className="card"><h3>Why the transfer pays</h3><p>The destination has a validated 60-day demand signal and the source has excess inside its risk horizon. At this quantity, every unit beyond the <b>{num(breakEven)}-unit break-even point</b> contributes to avoided inventory loss.</p></div><div className="card"><h3>Decision pace</h3><p>Modeled net value protected is approximately <b>{money(valuePerDay)}</b> per transfer lead-time day, with <b>{src.daysRemaining} days</b> remaining on the source risk clock.</p></div></div></section>}

function Export(){const[title,setTitle]=useState('Network Inventory — Executive Decision Brief');function download(){const top=allocations.slice(0,5);const html=`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:42px;color:#172033;max-width:1100px;margin:auto}h1{color:#0b1f3a}p{line-height:1.55}.k{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:25px 0}.k div{padding:16px;background:#f3f6f9;border-radius:10px}.k span{font-size:12px;color:#667085}.k b{display:block;font-size:22px;margin-top:6px}table{border-collapse:collapse;width:100%;font-size:12px}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left}th{background:#f3f6f9}.note{margin-top:25px;color:#667085;font-size:11px}</style></head><body><h1>${title}</h1><p>Connected manufacturing network view covering inventory exposure, demand matching, transfer economics and value recovery.</p><div class="k"><div><span>Inventory Value</span><b>${money(metrics.totalInventoryValue)}</b></div><div><span>Value at Risk</span><b>${money(metrics.valueAtRisk)}</b></div><div><span>Net Recoverable</span><b>${money(metrics.recoverableNet)}</b></div><div><span>Recovery Rate</span><b>${pct(metrics.recoveryRate)}</b></div></div><h2>Recommended actions</h2><table><tr><th>Source</th><th>Destination</th><th>SKU</th><th>Qty</th><th>Net Value</th><th>Confidence</th></tr>${top.map(r=>`<tr><td>${r.from}</td><td>${r.to}</td><td>${r.sku}</td><td>${num(r.qty)}</td><td>${money(r.net)}</td><td>${pct(r.confidence)}</td></tr>`).join('')}</table><p class="note">Net recoverable value is calculated after modeled lane logistics and without double-counting source excess or destination demand.</p></body></html>`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='inventory-executive-decision-brief.html';a.click()}const top=allocations[0];const email=`Subject: Inventory redistribution opportunity — ${money(metrics.recoverableNet)} net value identified\n\nHi [Name],\n\nWe recently worked through this type of manufacturing supply-chain problem: high-value inventory was sitting in one part of the network while demand for the same material existed elsewhere.\n\nUsing a connected view of inventory, demand, quality and transfer economics, this sample control tower identifies ${money(metrics.valueAtRisk)} of value at risk and ${money(metrics.recoverableNet)} of net recoverable value across the current network snapshot.\n\nThe first recommended action is ${top.from} → ${top.to}: ${num(top.qty)} units of ${top.sku}, with ${pct(top.confidence)} demand confidence and ${money(top.net)} of estimated net value protected.\n\nSharing the interactive view in case this challenge is relevant to your network as well.\n\nRegards,\n[Name]`;return <section><div className="sectionHead"><SectionTitle title="Executive Export" text="The exported story uses the same reconciled KPIs and recommendations shown across the system." info="Use this page when you want to export a brief or copy a quick outreach message."/></div><label>Report title<input value={title} onChange={e=>setTitle(e.target.value)}/></label><div className="exportGrid"><div className="card"><FileDown/><h3>Executive Decision Brief</h3><p>Generate a lightweight HTML brief containing the network KPIs, recovery rate and top actions.</p><button className="primary fit" onClick={download}><Download size={17}/> Download HTML</button></div><div className="card"><Mail/><h3>CXO outreach draft</h3><textarea className="emailText" value={email} readOnly/><button className="secondary fit" onClick={()=>navigator.clipboard.writeText(email)}>Copy email</button></div></div></section>}

createRoot(document.getElementById('root')).render(<App/>);
