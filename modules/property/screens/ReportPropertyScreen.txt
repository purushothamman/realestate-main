import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import {
  ArrowLeft, MapPin, DollarSign, Image as ImageIcon, Camera, X, Check,
  Wifi, Car, Dumbbell, Trees, ShieldCheck, Droplets, Sparkles, CheckCircle2,
  Bed, Bath, ArrowUpDown, Wind, Zap, Building, Building2, Flame, Droplet,
  Dog, Utensils, Sofa, FileText, Upload, Save, HelpCircle, Clock,
  AlertCircle, AlertTriangle, Send, Tag, Maximize, Shield, RefreshCw,
  Ban, MapPinOff, ImageOff, FileWarning, UserX, Scale,
  MoreHorizontal, ChevronRight, ChevronDown, ChevronUp, Info, Lock,
  Phone, CheckCheck, Trash2
} from "lucide-react";

// ─── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  brand:        "#1B5E3B",
  brandLight:   "#2D6A4F",
  brandSurface: "#F0FDF4",
  brandBorder:  "#BBF7D0",
  brandMid:     "#6EE7B7",
  danger:       "#EF4444",
  dangerSurf:   "#FEF2F2",
  amber:        "#F59E0B",
  amberSurf:    "#FEF3C7",
  purple:       "#A855F7",
  purpleSurf:   "#F3E8FF",
  blue:         "#3B82F6",
  blueSurf:     "#DBEAFE",
  n50:          "#F9FAFB",
  n100:         "#F3F4F6",
  n200:         "#E5E7EB",
  n400:         "#9CA3AF",
  n500:         "#6B7280",
  n700:         "#374151",
  n800:         "#1F2937",
  n900:         "#111827",
  white:        "#FFFFFF",
  success:      "#059669",
  successSurf:  "#ECFDF5",
  // Extended palette for report reasons
  green:        "#16A34A",
  greenSurf:    "#DCFCE7",
  indigo:       "#4F46E5",
  indigoSurf:   "#EEF2FF",
  brown:        "#92400E",
  brownSurf:    "#FEF3C7",
  gray:         "#4B5563",
  graySurf:     "#F3F4F6",
  orange:       "#EA580C",
  orangeSurf:   "#FFF7ED",
  pink:         "#DB2777",
  pinkSurf:     "#FDF2F8",
  slate:        "#475569",
  slateSurf:    "#F8FAFC",
  red:          "#DC2626",
  redSurf:      "#FEF2F2",
};

// ─── Fallback icons for ones that don't exist in lucide-react ─────────────────
// BuildingOff → Ban, DropletOff → Droplet, ShieldX → Shield, ShieldBan → Shield
const BuildingOffIcon = Ban;
const DropletOffIcon  = Droplet;
const ShieldXIcon     = Shield;
const ShieldBanIcon   = Ban;

// ─── Static Data ─────────────────────────────────────────────────────────────
const PROPERTY = {
  title:        "Skyline Heights — Luxury Penthouse",
  typeLabel:    "Penthouse",
  purposeLabel: "For Sale",
  price:        "₹4,85,00,000",
  area:         "6,200 sq ft",
  bedrooms:     "4 BHK",
  bathrooms:    "5",
};

const LOCATION = {
  address: "14B, Oberoi Garden Estates, Chandivali Farm Road",
  city:    "Mumbai",
  state:   "Maharashtra",
  pincode: "400072",
};

const AMENITIES = [
  { id: "wifi",           label: "WiFi",             Icon: Wifi },
  { id: "parking",        label: "Parking",           Icon: Car },
  { id: "gym",            label: "Gym",               Icon: Dumbbell },
  { id: "pool",           label: "Swimming Pool",     Icon: Droplets },
  { id: "security",       label: "24/7 Security",     Icon: ShieldCheck },
  { id: "elevator",       label: "Elevator",          Icon: ArrowUpDown },
  { id: "ac",             label: "Air Conditioning",  Icon: Wind },
  { id: "powerBackup",    label: "Power Backup",      Icon: Zap },
  { id: "cctv",           label: "CCTV",              Icon: Camera },
  { id: "balcony",        label: "Balcony",           Icon: Building },
  { id: "modularKitchen", label: "Modular Kitchen",   Icon: Utensils },
  { id: "furnished",      label: "Furnished",         Icon: Sofa },
  { id: "fireSystem",     label: "Fire Safety",       Icon: Flame },
  { id: "waterSupply",    label: "Water Supply 24/7", Icon: Droplet },
  { id: "petFriendly",    label: "Pet Friendly",      Icon: Dog },
  { id: "spa",            label: "Spa",               Icon: Sparkles },
];

const REPORT_REASONS = [
  { id: "verification",          label: "Needs Verification",                              Icon: CheckCircle2,   color: C.blue,   bg: C.blueSurf   },
  { id: "suspected_scam",        label: "Suspected Scam / Fraud",                          Icon: AlertTriangle,  color: C.danger, bg: C.dangerSurf },
  { id: "incorrect_information", label: "Incorrect / Misleading Information",              Icon: AlertCircle,    color: C.amber,  bg: C.amberSurf  },
  { id: "pricing_issue",         label: "Pricing / Hidden Charges Issue",                  Icon: DollarSign,     color: C.green,  bg: C.greenSurf  },
  { id: "location_mismatch",     label: "Incorrect / Manipulated Location",                Icon: MapPinOff,      color: C.indigo, bg: C.indigoSurf },
  { id: "construction_issue",    label: "Construction / Structural Issue",                 Icon: BuildingOffIcon,color: C.brown,  bg: C.brownSurf  },
  { id: "legal_issue",           label: "Legal / Ownership / Registration Issue",          Icon: Scale,          color: C.brown,  bg: C.brownSurf  },
  { id: "listing_status_issue",  label: "Listing Status Issue (Sold / Expired / Duplicate)", Icon: Clock,        color: C.gray,   bg: C.graySurf   },
  { id: "owner_agent_issue",     label: "Owner / Agent Behavior Issue",                   Icon: UserX,          color: C.orange, bg: C.orangeSurf },
  { id: "image_issue",           label: "Image Issue (Fake / Low Quality)",                Icon: ImageOff,       color: C.pink,   bg: C.pinkSurf   },
  { id: "utility_issue",         label: "Water / Electricity Issue",                       Icon: DropletOffIcon, color: C.blue,   bg: C.blueSurf   },
  { id: "safety_concern",        label: "Safety Concern",                                  Icon: ShieldXIcon,    color: C.danger, bg: C.dangerSurf },
  { id: "policy_violation",      label: "Spam / Policy Violation",                         Icon: ShieldBanIcon,  color: C.red,    bg: C.redSurf    },
  { id: "other",                 label: "Other",                                            Icon: MoreHorizontal, color: C.slate,  bg: C.slateSurf  },
];

const RECENT_REPORTS = [
  { id: 1, propertyName: "Sunset Boulevard Villa",    location: "Beverly Hills, CA", status: "pending",  date: "2 days ago" },
  { id: 2, propertyName: "Downtown Luxury Apartment", location: "Manhattan, NY",     status: "review",   date: "1 week ago" },
  { id: 3, propertyName: "Modern Beachfront House",   location: "Miami Beach, FL",   status: "approved", date: "2 weeks ago" },
];

const MAX_DESC  = 500;
const MAX_NOTES = 250;
const MAX_IMGS  = 6;

const STATUS_CFG = {
  pending:  { Icon: Clock,     color: "#D97706",    bg: "#FEF3C7",      label: "Pending" },
  approved: { Icon: Check,     color: C.success,    bg: "#D1FAE5",      label: "Approved" },
  review:   { Icon: RefreshCw, color: C.brandLight, bg: C.brandSurface, label: "In Review" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AutoFilledBadge = memo(() => (
  <span style={{display:"flex",alignItems:"center",gap:4,background:C.successSurf,border:`1px solid ${C.brandMid}`,borderRadius:10,padding:"4px 10px",fontSize:11,color:C.success,fontWeight:700,whiteSpace:"nowrap"}}>
    <CheckCircle2 size={11} color={C.success} /> Auto-filled
  </span>
));

const PrivacyBanner = memo(() => (
  <div style={{display:"flex",alignItems:"flex-start",gap:8,background:C.brandSurface,borderRadius:12,padding:14,border:`1px solid ${C.brandBorder}`,marginBottom:20}}>
    <Lock size={14} color={C.brandLight} style={{flexShrink:0,marginTop:2}} />
    <p style={{margin:0,fontSize:12,color:C.brandLight,lineHeight:"18px"}}>
      Your report is <strong>strictly confidential</strong>. Personal details are never shared with the property owner.
    </p>
  </div>
));

const GuidanceBanner = memo(() => (
  <div style={{background:C.blueSurf,borderRadius:12,padding:14,border:`1px solid ${C.blue}33`,marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
      <Info size={14} color={C.blue} />
      <span style={{fontSize:13,fontWeight:700,color:C.blue}}>What makes a good report?</span>
    </div>
    <p style={{margin:0,fontSize:12,color:"#1D4ED8",lineHeight:"18px"}}>
      Include specific details: exact discrepancies noticed, dates you observed issues, comparison with listed details, and any verifiable evidence. Vague reports may take longer to review.
    </p>
  </div>
));

const SectionHeader = memo(({ icon: Icon, iconBg, iconColor, title, subtitle, badge }) => (
  <div style={{display:"flex",alignItems:"center",marginBottom:20,gap:12}}>
    <div style={{width:40,height:40,borderRadius:12,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Icon color={iconColor} size={20} />
    </div>
    <div style={{flex:1}}>
      <div style={{fontSize:17,fontWeight:700,color:C.n900}}>{title}</div>
      {subtitle && <div style={{fontSize:12,color:C.n500,marginTop:2}}>{subtitle}</div>}
    </div>
    {badge}
  </div>
));

const DisplayField = memo(({ label, value, Icon, variant }) => (
  <div style={{marginBottom:16}}>
    <div style={{fontSize:12,fontWeight:600,color:C.n500,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</div>
    <div style={{display:"flex",alignItems:"flex-start",gap:8,background: variant==="location" ? C.brandSurface : C.n50,borderRadius:12,padding:"12px 14px",border:`1px solid ${variant==="location" ? C.brandBorder : C.n200}`}}>
      {Icon && <Icon color={variant==="location" ? C.blue : C.brandLight} size={16} style={{flexShrink:0,marginTop:2}} />}
      <span style={{fontSize:15,color:C.n900,fontWeight:600,lineHeight:"22px"}}>{value}</span>
    </div>
  </div>
));

const StatCard = memo(({ Icon, iconColor, value, label }) => (
  <div style={{flex:"1 1 45%",minWidth:120,background:C.n50,borderRadius:14,padding:"14px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,border:`1px solid ${C.n200}`}}>
    <Icon color={iconColor} size={18} />
    <span style={{fontSize:14,fontWeight:700,color:C.n900,textAlign:"center"}}>{value}</span>
    <span style={{fontSize:11,color:C.n500,fontWeight:500}}>{label}</span>
  </div>
));

const FieldError = memo(({ message }) =>
  message ? (
    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}} role="alert">
      <AlertCircle size={12} color={C.danger} />
      <span style={{fontSize:12,color:C.danger,fontWeight:500}}>{message}</span>
    </div>
  ) : null
);

const CharCounter = memo(({ current, max }) => {
  const near = current > max * 0.85;
  const over  = current >= max;
  return (
    <div style={{textAlign:"right",fontSize:11,color: over ? C.danger : near ? C.amber : C.n400,fontWeight: over ? 700 : 400,marginTop:4}}>
      {current}/{max}
    </div>
  );
});

const RecentReportCard = memo(({ propertyName, location, status, date }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const StatusIcon = cfg.Icon;
  return (
    <div style={{background:C.n50,borderRadius:14,padding:16,border:`1px solid ${C.n200}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1,marginRight:12}}>
          <div style={{fontSize:14,color:C.n900,fontWeight:700,marginBottom:4}}>{propertyName}</div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <MapPin size={12} color={C.n500} />
            <span style={{fontSize:12,color:C.n500}}>{location}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,background:cfg.bg,padding:"6px 10px",borderRadius:10,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:3,background:cfg.color}} />
          <StatusIcon size={12} color={cfg.color} />
          <span style={{fontSize:12,fontWeight:700,color:cfg.color}}>{cfg.label}</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,borderTop:`1px solid ${C.n200}`,paddingTop:8}}>
        <Clock size={11} color={C.n400} />
        <span style={{fontSize:11,color:C.n400}}>{date}</span>
      </div>
    </div>
  );
});

const Toast = memo(({ message, visible, Icon, color }) => (
  <div style={{
    position:"fixed",bottom:90,left:"50%",transform:`translateX(-50%) translateY(${visible?0:20}px)`,
    opacity: visible ? 1 : 0,
    transition:"all 0.25s ease",
    display:"flex",alignItems:"center",gap:8,
    background:C.white,padding:"10px 18px",borderRadius:20,
    border:`1.5px solid ${color}33`,
    boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
    zIndex:999,pointerEvents:"none",
    whiteSpace:"nowrap",
  }}>
    {Icon && <Icon size={14} color={color} />}
    <span style={{fontSize:13,fontWeight:700,color}}>{message}</span>
  </div>
));

const ProgressBar = memo(({ filled, total }) => {
  const pct = (filled / total) * 100;
  const steps = ["Reason", "Description", "Evidence"];
  return (
    <div style={{background:C.white,padding:"12px 20px 14px",borderBottom:`1px solid ${C.n200}`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        {steps.map((step, i) => {
          const done   = i < filled;
          const active = i === filled;
          return (
            <div key={step} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{
                width:22,height:22,borderRadius:11,
                background: done ? C.success : C.n200,
                border:`2px solid ${done ? C.success : active ? C.brandLight : C.n200}`,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                {done
                  ? <Check size={10} color={C.white} strokeWidth={3} />
                  : <span style={{fontSize:11,color: active ? C.brandLight : C.n500,fontWeight:700}}>{i+1}</span>
                }
              </div>
              <span style={{fontSize:10,color: done ? C.success : C.n400,fontWeight:600}}>{step}</span>
            </div>
          );
        })}
      </div>
      <div style={{height:5,background:C.n200,borderRadius:3,overflow:"hidden"}} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{height:"100%",background:C.brandLight,borderRadius:3,width:`${pct}%`,transition:"width 0.4s ease"}} />
      </div>
      <div style={{textAlign:"right",fontSize:11,color:C.n400,fontWeight:600,marginTop:4}}>{Math.round(pct)}% complete</div>
    </div>
  );
});

const SuccessScreen = memo(({ onBack }) => (
  <div style={{display:"flex",flex:1,flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.brandSurface,minHeight:"100vh",padding:"32px 24px",textAlign:"center"}}>
    <div style={{
      width:100,height:100,borderRadius:50,
      background:C.brandLight,
      display:"flex",alignItems:"center",justifyContent:"center",
      boxShadow:`0 8px 30px ${C.brandLight}55`,
      marginBottom:32,
      animation:"popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
    }}>
      <CheckCheck color={C.white} size={44} strokeWidth={2.5} />
    </div>
    <h2 style={{fontSize:28,fontWeight:800,color:C.n900,margin:"0 0 8px"}}>Report Submitted!</h2>
    <div style={{fontSize:14,color:C.n500,fontFamily:"monospace",marginBottom:16,background:C.n100,padding:"4px 12px",borderRadius:8,display:"inline-block"}}>
      Ref #RPT-2026-00847
    </div>
    <p style={{fontSize:15,color:C.n700,lineHeight:"24px",marginBottom:20,maxWidth:340}}>
      Our verification team will review this within <strong style={{color:C.brand}}>24–48 hours</strong>. You'll be notified once the review is complete.
    </p>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:32,background:C.white,padding:"8px 14px",borderRadius:10,border:`1px solid ${C.brandBorder}`}}>
      <Shield size={14} color={C.brandLight} />
      <span style={{fontSize:13,color:C.brandLight,fontWeight:600}}>Your identity remains fully confidential</span>
    </div>
    <button onClick={onBack} style={{
      background:C.brandLight,color:C.white,fontSize:16,fontWeight:700,
      border:"none",borderRadius:16,padding:"16px 40px",cursor:"pointer",
      boxShadow:`0 4px 16px ${C.brandLight}44`,
    }}>
      Back to Listing
    </button>
    <style>{`@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
  </div>
));

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportPropertyScreen = ({ onBack = () => {} }) => {
  const [reportData, setReportData] = useState({ reportReason:"", description:"", additionalNotes:"", contactRef:"" });
  const [errors, setErrors]         = useState({});
  const [uploadedImages, setUploaded] = useState([]);
  const [focused, setFocused]       = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const [toast, setToast]           = useState({ visible:false, message:"", color:C.success, Icon:Check });

  const filledCount = useMemo(() => {
    let n = 0;
    if (reportData.reportReason) n++;
    if (reportData.description.trim().length >= 20) n++;
    if (uploadedImages.length > 0) n++;
    return n;
  }, [reportData.reportReason, reportData.description, uploadedImages.length]);

  const showToast = useCallback((message, color = C.success, Icon = Check) => {
    setToast({ visible:true, message, color, Icon });
    setTimeout(() => setToast(prev => ({ ...prev, visible:false })), 2500);
  }, []);

  const handleChange = useCallback((field, value) => {
    setReportData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  const handleReason = useCallback((id) => {
    setReportData(prev => ({ ...prev, reportReason: id }));
    setErrors(prev => ({ ...prev, reportReason: null }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > MAX_IMGS) {
      showToast(`Max ${MAX_IMGS} images allowed`, C.danger, AlertCircle);
      return;
    }
    const urls = files.map(f => URL.createObjectURL(f));
    setUploaded(prev => [...prev, ...urls]);
    e.target.value = "";
  }, [uploadedImages.length, showToast]);

  const removeImage = useCallback((i) => setUploaded(prev => prev.filter((_,idx) => idx !== i)), []);

  const validate = useCallback(() => {
    const errs = {};
    if (!reportData.reportReason) errs.reportReason = "Please select a reason for your report.";
    if (reportData.description.trim().length < 20) errs.description = "Description must be at least 20 characters.";
    if (reportData.description.length > MAX_DESC) errs.description = `Description must be under ${MAX_DESC} characters.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [reportData]);

  const handleSubmit = useCallback(() => {
    if (!validate()) { showToast("Please fix the errors above", C.danger, AlertCircle); return; }
    if (isSubmitting) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1800);
  }, [validate, isSubmitting, showToast]);

  const handleReset = useCallback(() => {
    if (!window.confirm("This will clear all your entered information. Continue?")) return;
    setReportData({ reportReason:"", description:"", additionalNotes:"", contactRef:"" });
    setUploaded([]);
    setErrors({});
  }, []);

  if (submitted) return <SuccessScreen onBack={onBack} />;

  const inputStyle = (fieldKey) => ({
    width:"100%",boxSizing:"border-box",
    border:`2px solid ${errors[fieldKey] ? C.danger : focused === fieldKey ? C.brandLight : C.n200}`,
    borderRadius:14,background: focused === fieldKey ? C.white : C.n50,
    padding:"12px 16px",fontSize:14,color:C.n900,lineHeight:"22px",
    outline:"none",resize:"vertical",fontFamily:"inherit",
    boxShadow: focused === fieldKey ? `0 0 0 3px ${C.brandLight}22` : "none",
    transition:"all 0.2s",
  });

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:C.n100,fontFamily:"'Segoe UI', system-ui, sans-serif",position:"relative"}}>

      {/* ── Header ── */}
      <div style={{height:185,position:"relative",overflow:"hidden",flexShrink:0}}>
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800" alt="Building" style={{width:"100%",height:"100%",objectFit:"cover"}} />
        <div style={{position:"absolute",inset:0,background:"rgba(27,94,59,0.88)"}} />
        <div style={{position:"absolute",inset:0,padding:"52px 22px 18px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={onBack} style={{width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <ArrowLeft color={C.white} size={20} strokeWidth={2.5} />
            </button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:C.white,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Building2 color={C.brandLight} size={18} />
              </div>
              <span style={{color:C.white,fontSize:17,fontWeight:700,letterSpacing:"0.4px"}}>EStateHub</span>
            </div>
            <button onClick={handleReset} style={{width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <Trash2 color="rgba(255,255,255,0.8)" size={17} />
            </button>
          </div>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(252,211,77,0.2)",border:"1px solid rgba(252,211,77,0.4)",borderRadius:10,padding:"5px 10px",marginBottom:8}}>
              <AlertTriangle color="#FCD34D" size={14} />
              <span style={{fontSize:11,color:"#FCD34D",fontWeight:800,letterSpacing:"1.5px"}}>REPORT</span>
            </div>
            <h1 style={{color:C.white,fontSize:28,fontWeight:800,margin:"0 0 6px",letterSpacing:"-0.5px"}}>Property Report</h1>
            <p style={{color:"rgba(255,255,255,0.85)",fontSize:13.5,margin:0,lineHeight:"20px"}}>
              Review auto-filled details and submit your report for verification
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress ── */}
      <ProgressBar filled={filledCount} total={3} />

      {/* ── Scrollable Content ── */}
      <div style={{flex:1,overflowY:"auto",padding:"0 18px 200px"}}>
        <div style={{
          background:C.white,borderRadius:20,padding:22,
          marginTop:-28,boxShadow:"0 4px 24px rgba(0,0,0,0.1)",
          position:"relative",zIndex:1,
        }}>
          <PrivacyBanner />

          {/* ── 1. Report Reason ── */}
          <section style={{marginBottom:26}}>
            <SectionHeader icon={AlertTriangle} iconBg={C.dangerSurf} iconColor={C.danger} title="Report Reason" subtitle="Select the most applicable category" />
            <div style={{display:"flex",flexWrap:"wrap",gap:10}} role="radiogroup" aria-label="Report reason options">
              {REPORT_REASONS.map(r => {
                const sel = reportData.reportReason === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleReason(r.id)}
                    role="radio"
                    aria-checked={sel}
                    style={{
                      flex:"1 1 47%",minWidth:140,
                      padding:"13px 12px",
                      border:`2px solid ${sel ? r.color : C.n200}`,
                      borderRadius:14,
                      display:"flex",alignItems:"center",gap:9,
                      background: sel ? r.bg : C.n50,
                      cursor:"pointer",
                      transition:"all 0.15s",
                      textAlign:"left",
                    }}
                  >
                    <div style={{width:34,height:34,borderRadius:10,background: sel ? r.color+"25" : C.n100,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <r.Icon color={sel ? r.color : C.n500} size={17} strokeWidth={2.5} />
                    </div>
                    <span style={{flex:1,fontSize:13.5,color: sel ? r.color : C.n700,fontWeight: sel ? 700 : 500}}>{r.label}</span>
                    {sel && (
                      <div style={{width:20,height:20,borderRadius:10,background:r.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Check color={C.white} size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.reportReason} />
          </section>

          {/* ── 2. Property Details ── */}
          <section style={{marginBottom:26,paddingTop:26,borderTop:`1px solid ${C.n200}`}}>
            <SectionHeader icon={Building2} iconBg={C.brandSurface} iconColor={C.brandLight} title="Property Details" badge={<AutoFilledBadge />} />
            <DisplayField label="Property Title" value={PROPERTY.title} Icon={FileText} />
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}><DisplayField label="Type"    value={PROPERTY.typeLabel}    Icon={Building} /></div>
              <div style={{flex:1}}><DisplayField label="Purpose" value={PROPERTY.purposeLabel} Icon={Tag} /></div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:4}}>
              <StatCard Icon={DollarSign} iconColor="#F59E0B" value={PROPERTY.price}     label="Price" />
              <StatCard Icon={Maximize}   iconColor={C.blue}  value={PROPERTY.area}      label="Area" />
              <StatCard Icon={Bed}        iconColor="#8B5CF6" value={PROPERTY.bedrooms}  label="Bedrooms" />
              <StatCard Icon={Bath}       iconColor="#10B981" value={PROPERTY.bathrooms} label="Bathrooms" />
            </div>
          </section>

          {/* ── 3. Location ── */}
          <section style={{marginBottom:26,paddingTop:26,borderTop:`1px solid ${C.n200}`}}>
            <SectionHeader icon={MapPin} iconBg={C.blueSurf} iconColor={C.blue} title="Location Details" badge={<AutoFilledBadge />} />
            <DisplayField label="Address" value={LOCATION.address} Icon={MapPin} variant="location" />
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}><DisplayField label="City"  value={LOCATION.city} /></div>
              <div style={{flex:1}}><DisplayField label="State" value={LOCATION.state} /></div>
            </div>
            <DisplayField label="Pincode" value={LOCATION.pincode} />
          </section>

          {/* ── 4. Evidence Photos ── */}
          <section style={{marginBottom:26,paddingTop:26,borderTop:`1px solid ${C.n200}`}}>
            <SectionHeader
              icon={ImageIcon} iconBg={C.purpleSurf} iconColor={C.purple}
              title="Evidence Photos" subtitle="Optional but strongly recommended"
              badge={
                <span style={{
                  background: uploadedImages.length >= MAX_IMGS ? C.dangerSurf : C.brandSurface,
                  border:`1px solid ${uploadedImages.length >= MAX_IMGS ? C.danger+"55" : C.brandBorder}`,
                  borderRadius:10,padding:"5px 10px",fontSize:12,
                  color: uploadedImages.length >= MAX_IMGS ? C.danger : C.brandLight,
                  fontWeight:700,whiteSpace:"nowrap",
                }}>
                  {uploadedImages.length}/{MAX_IMGS}
                </span>
              }
            />
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
              {uploadedImages.map((img, i) => (
                <div key={i} style={{width:100,height:100,borderRadius:12,overflow:"hidden",position:"relative",flexShrink:0}}>
                  <img src={img} alt={`Evidence ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  {i===0 && <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.45)",padding:"3px 0",textAlign:"center",fontSize:10,color:C.white,fontWeight:700,letterSpacing:"0.5px"}}>Cover</div>}
                  <button onClick={() => removeImage(i)} style={{position:"absolute",top:6,right:6,width:26,height:26,borderRadius:13,background:C.danger,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}>
                    <X color={C.white} size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
              {uploadedImages.length < MAX_IMGS && (
                <label style={{
                  width:100,height:100,borderRadius:12,
                  border:`2px dashed ${uploadedImages.length === 0 ? C.brandMid : C.n200}`,
                  background: uploadedImages.length === 0 ? C.brandSurface : C.n50,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",gap:4,flexShrink:0,
                }}>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display:"none"}} />
                  <div style={{width:46,height:46,borderRadius:23,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Camera color={C.brandLight} size={22} />
                  </div>
                  <span style={{fontSize:11,color:C.brandLight,fontWeight:700}}>Add Photo</span>
                </label>
              )}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <Info size={13} color={C.brandLight} />
              <span style={{fontSize:12,color:C.n500}}>First photo becomes the cover · Max {MAX_IMGS} images · JPG or PNG</span>
            </div>
          </section>

          {/* ── 5. Description ── */}
          <section style={{marginBottom:26,paddingTop:26,borderTop:`1px solid ${C.n200}`}}>
            <SectionHeader icon={FileText} iconBg={C.blueSurf} iconColor={C.blue} title="Issue Description" />
            <GuidanceBanner />

            <div style={{marginBottom:18}}>
              <label style={{display:"block",fontSize:14,color:C.n700,marginBottom:8,fontWeight:600}}>
                Describe the issue <span style={{color:C.danger}}>*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe the issue, key concerns, or suspicious activity in detail..."
                value={reportData.description}
                onChange={e => handleChange("description", e.target.value.slice(0, MAX_DESC))}
                onFocus={() => setFocused("description")}
                onBlur={() => setFocused(null)}
                aria-label="Issue description"
                aria-required="true"
                style={{...inputStyle("description"), minHeight:120}}
              />
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:2}}>
                <FieldError message={errors.description} />
                <CharCounter current={reportData.description.length} max={MAX_DESC} />
              </div>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{display:"block",fontSize:14,color:C.n700,marginBottom:8,fontWeight:600}}>
                Additional Notes <span style={{color:C.n400,fontWeight:400}}>(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Any supplementary information that may help our review team..."
                value={reportData.additionalNotes}
                onChange={e => handleChange("additionalNotes", e.target.value.slice(0, MAX_NOTES))}
                onFocus={() => setFocused("notes")}
                onBlur={() => setFocused(null)}
                style={{...inputStyle("notes"), minHeight:90}}
              />
              <CharCounter current={reportData.additionalNotes.length} max={MAX_NOTES} />
            </div>

            <div style={{marginBottom:18}}>
              <label style={{display:"block",fontSize:14,color:C.n700,marginBottom:8,fontWeight:600}}>
                Your Contact Reference <span style={{color:C.n400,fontWeight:400}}>(Optional)</span>
              </label>
              <div style={{
                display:"flex",alignItems:"center",gap:8,
                border:`2px solid ${focused==="contactRef" ? C.brandLight : C.n200}`,
                borderRadius:14,background: focused==="contactRef" ? C.white : C.n50,
                padding:"12px 14px",
                boxShadow: focused==="contactRef" ? `0 0 0 3px ${C.brandLight}22` : "none",
                transition:"all 0.2s",
              }}>
                <Phone size={16} color={C.n400} style={{flexShrink:0}} />
                <input
                  type="text"
                  placeholder="Phone or email for follow-up (optional)"
                  value={reportData.contactRef}
                  onChange={e => handleChange("contactRef", e.target.value)}
                  onFocus={() => setFocused("contactRef")}
                  onBlur={() => setFocused(null)}
                  style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:14,color:C.n900,fontFamily:"inherit"}}
                />
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:5}}>
                <Lock size={11} color={C.n400} />
                <span style={{fontSize:11,color:C.n400}}>Used only for follow-up, never shared</span>
              </div>
            </div>
          </section>

          {/* ── 6. Amenities ── */}
          <section style={{marginBottom:26,paddingTop:26,borderTop:`1px solid ${C.n200}`}}>
            <SectionHeader icon={Sparkles} iconBg={C.brandSurface} iconColor={C.brandLight} title="Listed Amenities" subtitle="As reported by the property owner" badge={<AutoFilledBadge />} />
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {AMENITIES.map(({ id, label, Icon }) => (
                <div key={id} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 11px",borderRadius:20,background:C.brandSurface,border:`1px solid ${C.brandBorder}`}}>
                  <Icon color={C.brandLight} size={14} strokeWidth={2.5} />
                  <span style={{fontSize:12.5,color:C.brandLight,fontWeight:600}}>{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 7. Recent Reports ── */}
          <section style={{marginBottom:26,paddingTop:26,borderTop:`1px solid ${C.n200}`}}>
            <button
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:"transparent",border:"none",cursor:"pointer",padding:0,marginBottom:expanded?16:0,textAlign:"left"}}
            >
              <div style={{width:40,height:40,borderRadius:12,background:C.amberSurf,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Clock color={C.amber} size={20} />
              </div>
              <div style={{flex:1}}>
                <span style={{fontSize:17,fontWeight:700,color:C.n900}}>Your Recent Reports</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,background:C.amberSurf,padding:"5px 10px",borderRadius:10,flexShrink:0}}>
                <Clock size={11} color="#B45309" />
                <span style={{fontSize:11,color:"#B45309",fontWeight:700}}>2 Pending</span>
              </div>
              {expanded ? <ChevronUp size={18} color={C.n500} /> : <ChevronDown size={18} color={C.n500} />}
            </button>

            {expanded && (
              <>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:4}}>
                  {RECENT_REPORTS.map(r => <RecentReportCard key={r.id} {...r} />)}
                </div>
                <button style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:14,padding:"10px 0",background:"transparent",border:"none",cursor:"pointer"}}>
                  <span style={{fontSize:14,color:C.brandLight,fontWeight:700}}>View All Reports</span>
                  <ChevronRight size={15} color={C.brandLight} strokeWidth={2.5} />
                </button>
              </>
            )}
          </section>

          {/* SLA box */}
          <div style={{display:"flex",alignItems:"flex-start",gap:8,background:C.brandSurface,borderRadius:12,padding:14,border:`1px solid ${C.brandBorder}`,marginTop:6}}>
            <Shield size={14} color={C.brandLight} style={{flexShrink:0,marginTop:2}} />
            <p style={{margin:0,fontSize:12,color:C.brandLight,lineHeight:"18px"}}>
              Reports are reviewed within <strong>24–48 hours</strong>. You'll be notified via email when the status changes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      <Toast {...toast} />

      {/* ── Bottom Action Bar ── */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,
        background:C.white,
        borderTop:`1px solid ${C.n200}`,
        padding:"14px 18px 24px",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.08)",
        zIndex:100,
      }}>
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <button
            onClick={() => showToast("Draft saved successfully", C.success, Check)}
            style={{flex:1,height:48,border:`2px solid ${C.n200}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:C.n50,cursor:"pointer",fontSize:14.5,fontWeight:700,color:C.n500}}
          >
            <Save color={C.n500} size={17} /> Save Draft
          </button>
          <button
            onClick={() => alert("Use this form to flag properties that appear fraudulent, have incorrect details, or need verification.\n\nYour identity is kept confidential throughout the process.")}
            style={{width:48,height:48,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:C.n50,border:`2px solid ${C.n200}`,cursor:"pointer"}}
          >
            <HelpCircle color={C.n500} size={19} />
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width:"100%",height:56,
            background: isSubmitting ? C.n500 : C.brandLight,
            color:C.white,fontSize:16.5,fontWeight:700,letterSpacing:"0.4px",
            border:"none",borderRadius:16,cursor: isSubmitting ? "not-allowed" : "pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:9,
            boxShadow:`0 4px 16px ${C.brandLight}44`,
            transition:"background 0.2s",
          }}
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? <><RefreshCw color={C.white} size={19} strokeWidth={2.5} style={{animation:"spin 1s linear infinite"}} /> Submitting…</>
            : <><Send color={C.white} size={19} /> Submit Report</>
          }
        </button>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        textarea { font-family: inherit; }
        input { font-family: inherit; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }
        button:focus-visible { outline: 2px solid ${C.brandLight}; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.n100}; }
        ::-webkit-scrollbar-thumb { background: ${C.n400}; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default ReportPropertyScreen;
