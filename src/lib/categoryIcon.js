import {
  ArrowRight, Star, Shield, CheckCircle, Award,
  ChevronRight, Sparkles, Globe, Users, Zap,
  Building2, Cpu, Megaphone, Briefcase, HeartPulse,
  Factory, GraduationCap, Truck, Wrench, Plane, Ship,
  ShoppingBag, Home as HomeIcon, Scale, Palette,
  Leaf, Printer, Brain, Dumbbell, FlaskConical, Anchor,
  Camera, Music, Film, Utensils, Car, Hammer, TreePine,
  Sprout, Building, Bitcoin, CreditCard, Stethoscope,
  Dna, Atom, Radio, Tv, Newspaper, BookOpen, Pen,
  Database, Cloud, Lock, Bug, Smartphone, Wifi, Box,
  Package, Warehouse, Train, Bus, Bike, Rocket, Satellite,
  Landmark, Gavel, Coins, TrendingUp, Tractor, Wheat,
  Droplet, Flame, Sun, Wind, Beaker, Microscope,
} from 'lucide-react';

const RULES = [
  [/aerospace|aviation|airline|aircraft|drone/, Plane],
  [/space|satellite|rocket|orbital/,            Rocket],
  [/marine|shipping|maritime|naval|port|harbor/, Ship],
  [/automotive|auto|car |vehicle/,              Car],
  [/train|rail/,                                Train],
  [/transit|bus /,                              Bus],
  [/cycle|bike|bicycle/,                        Bike],
  [/logistics|freight|warehous|supply|courier|trucking/, Truck],
  [/3d print|additive manufactur|printing/,     Printer],
  [/manufactur|fabricat|industr|factory|assembly|machining|foundry|mill/, Factory],
  [/construct|contractor|builder|carpentry|masonry|roofing|paving/, Hammer],
  [/plumb|hvac|electric|repair|maintenance/,    Wrench],
  [/ai\b|artificial intelligence|machine learning|deep learning|neural/, Brain],
  [/cyber|security|infosec|firewall|defense soft/, Lock],
  [/cloud|saas|devops|hosting|server/,          Cloud],
  [/data |database|analytics|big data|warehouse data/, Database],
  [/software|app |mobile|ios |android|sdk/,     Smartphone],
  [/network|telecom|5g|4g|wifi|wireless|broadband/, Wifi],
  [/it |technology|tech |software|platform/,    Cpu],
  [/defense|military|weapon|tactical|combat/,   Shield],
  [/biotech|life science|genom|dna|cell/,       Dna],
  [/pharma|drug|chemistry|chemical/,            FlaskConical],
  [/lab |laboratory|research|microscop/,        Microscope],
  [/health|medical|clinic|hospital|dental|veterinary|telemedicine|wellness|therapy/, Stethoscope],
  [/sports|fitness|gym|athletic|exercise/,      Dumbbell],
  [/food|restaurant|cafe|catering|bakery|culinary/, Utensils],
  [/agri|farm|crop|wheat|grain/,                Wheat],
  [/agro|seed|fertilizer|cultivation/,          Sprout],
  [/forest|timber|lumber|wood/,                 TreePine],
  [/environment|sustain|recycl|waste|green |eco /, Leaf],
  [/water|hydro|plumb|irrigat/,                 Droplet],
  [/oil|gas |petroleum|fuel|combustion/,        Flame],
  [/solar|photovoltaic/,                        Sun],
  [/wind |turbine|renewable/,                   Wind],
  [/energy|power |utility|electric/,            Zap],
  [/real estate|property|housing|residential/,  HomeIcon],
  [/commercial real|building|architecture|interior design/, Building],
  [/legal|law|attorney|paralegal|notary/,       Scale],
  [/court|judicial|litigation|judge/,           Gavel],
  [/government|public sector|municipal|civic|policy/, Landmark],
  [/account|audit|tax|bookkeeping|cpa|payroll/, Briefcase],
  [/bank|finance|investment|wealth|capital/,    Coins],
  [/credit|payment|fintech|loan|mortgage/,      CreditCard],
  [/crypto|blockchain|bitcoin|web3|nft/,        Bitcoin],
  [/trading|broker|stock|market |hedge/,        TrendingUp],
  [/marketing|advertis|seo|sem|brand|pr |creative agency/, Megaphone],
  [/media|news|journalism|publish|magazine|newspaper/, Newspaper],
  [/tv|television|broadcast/,                   Tv],
  [/radio|podcast|audio /,                      Radio],
  [/film|movie|cinema|video production/,        Film],
  [/music|audio|sound /,                        Music],
  [/photography|photo /,                        Camera],
  [/design|graphic|ux|ui/,                      Palette],
  [/writing|content|copywrit|editor /,          Pen],
  [/book|library|literature/,                   BookOpen],
  [/education|school|academy|training|tutor|university|edtech/, GraduationCap],
  [/retail|store|shop |boutique|outlet|ecommerce|e-commerce/, ShoppingBag],
  [/consumer|goods|fmcg|household/,             Package],
  [/staffing|recruit|hr |human resources|talent|hiring/, Users],
  [/travel|tourism|hotel|hospitality|cruise/,   Globe],
  [/agro chem|pesticide|herbicide/,             Beaker],
];

export function pickIconByText(text) {
  const lower = (text || '').toLowerCase();
  for (const [rx, Icon] of RULES) {
    if (rx.test(lower)) return Icon;
  }
  return Building2;
}

export function pickCategoryIcon(cat) {
  return pickIconByText(`${cat?.name || ''} ${cat?.slug || ''}`);
}

export function pickAgencyIcon(agency) {
  const services = Array.isArray(agency?.services_offered) ? agency.services_offered.join(' ') : '';
  return pickIconByText(`${agency?.name || ''} ${services}`);
}

const COLOR_POOL = [
  'bg-blue-50 border-blue-100 text-blue-600',
  'bg-violet-50 border-violet-100 text-violet-600',
  'bg-emerald-50 border-emerald-100 text-emerald-600',
  'bg-amber-50 border-amber-100 text-amber-600',
  'bg-cyan-50 border-cyan-100 text-cyan-600',
  'bg-pink-50 border-pink-100 text-pink-600',
  'bg-orange-50 border-orange-100 text-orange-600',
  'bg-rose-50 border-rose-100 text-rose-600',
  'bg-indigo-50 border-indigo-100 text-indigo-600',
];

export function colorFor(key) {
  let hash = 0;
  const s = key || '';
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return COLOR_POOL[hash % COLOR_POOL.length];
}
