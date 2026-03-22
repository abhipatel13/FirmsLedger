const SEO_YEAR = 2026;

/**
 * Countries to target for programmatic SEO.
 */
export const TARGET_COUNTRIES = [
  'india', 'united-states', 'united-kingdom', 'australia', 'canada',
  'germany', 'france', 'uae', 'singapore', 'south-africa',
  'netherlands', 'brazil', 'mexico', 'japan', 'new-zealand',
  'italy', 'spain', 'russia', 'china', 'south-korea',
  'malaysia', 'indonesia', 'thailand', 'vietnam', 'philippines',
  'nigeria', 'kenya', 'egypt', 'saudi-arabia', 'qatar',
  'sweden', 'norway', 'denmark', 'finland', 'switzerland',
  'austria', 'belgium', 'poland', 'turkey', 'israel',
  'argentina', 'chile', 'colombia', 'peru', 'bangladesh',
  'pakistan', 'sri-lanka', 'myanmar', 'cambodia', 'ghana',
];

/** Slug → Display name */
const COUNTRY_SLUG_MAP = {
  'india': 'India', 'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'australia': 'Australia', 'canada': 'Canada', 'germany': 'Germany', 'france': 'France',
  'uae': 'UAE', 'singapore': 'Singapore', 'south-africa': 'South Africa',
  'netherlands': 'Netherlands', 'brazil': 'Brazil', 'mexico': 'Mexico',
  'japan': 'Japan', 'new-zealand': 'New Zealand', 'italy': 'Italy', 'spain': 'Spain',
  'russia': 'Russia', 'china': 'China', 'south-korea': 'South Korea',
  'malaysia': 'Malaysia', 'indonesia': 'Indonesia', 'thailand': 'Thailand',
  'vietnam': 'Vietnam', 'philippines': 'Philippines', 'nigeria': 'Nigeria',
  'kenya': 'Kenya', 'egypt': 'Egypt', 'saudi-arabia': 'Saudi Arabia', 'qatar': 'Qatar',
  'sweden': 'Sweden', 'norway': 'Norway', 'denmark': 'Denmark', 'finland': 'Finland',
  'switzerland': 'Switzerland', 'austria': 'Austria', 'belgium': 'Belgium',
  'poland': 'Poland', 'turkey': 'Turkey', 'israel': 'Israel',
  'argentina': 'Argentina', 'chile': 'Chile', 'colombia': 'Colombia', 'peru': 'Peru',
  'bangladesh': 'Bangladesh', 'pakistan': 'Pakistan', 'sri-lanka': 'Sri Lanka',
  'myanmar': 'Myanmar', 'cambodia': 'Cambodia', 'ghana': 'Ghana',
};

/**
 * Cities mapped by country slug.
 * Format: { citySlug: { name: 'City Name', country: 'country-slug' } }
 */
const CITIES_BY_COUNTRY = {
  'india': [
    'mumbai','delhi','bangalore','hyderabad','chennai','pune','kolkata',
    'ahmedabad','surat','jaipur','lucknow','kanpur','nagpur','indore',
    'bhopal','visakhapatnam','pimpri-chinchwad','patna','vadodara','ghaziabad',
    'ludhiana','agra','nashik','faridabad','meerut','rajkot','varanasi',
    'srinagar','aurangabad','dhanbad','amritsar','navi-mumbai','allahabad',
    'ranchi','howrah','coimbatore','jabalpur','gwalior','vijayawada','jodhpur',
    'madurai','raipur','kota','guwahati','chandigarh','solapur','hubli',
    'thiruvananthapuram','tiruppur','kochi','mysuru',
  ],
  'united-states': [
    'new-york','los-angeles','chicago','houston','phoenix','philadelphia',
    'san-antonio','san-diego','dallas','san-jose','austin','jacksonville',
    'fort-worth','columbus','charlotte','indianapolis','san-francisco','seattle',
    'denver','washington-dc','boston','nashville','oklahoma-city','el-paso',
    'portland','las-vegas','memphis','louisville','baltimore','milwaukee',
    'albuquerque','tucson','fresno','mesa','sacramento','kansas-city',
    'atlanta','omaha','colorado-springs','raleigh','long-beach','virginia-beach',
    'miami','minneapolis','tampa','new-orleans','cleveland','pittsburgh',
    'detroit','orlando',
  ],
  'united-kingdom': [
    'london','birmingham','manchester','leeds','glasgow','sheffield','bradford',
    'liverpool','edinburgh','bristol','cardiff','belfast','leicester','coventry',
    'nottingham','newcastle','sunderland','brighton','hull','derby','stoke-on-trent',
    'wolverhampton','plymouth','southampton','reading','oxford','cambridge',
    'york','portsmouth','swansea','milton-keynes','aberdeen','exeter',
    'dundee','norwich','luton','middlesbrough','chester','bath','salisbury',
  ],
  'australia': [
    'sydney','melbourne','brisbane','perth','adelaide','gold-coast','newcastle',
    'canberra','sunshine-coast','wollongong','hobart','geelong','townsville',
    'cairns','toowoomba','darwin','ballarat','bendigo','albury','launceston',
    'mackay','rockhampton','maitland','bunbury','coffs-harbour',
  ],
  'canada': [
    'toronto','montreal','vancouver','calgary','edmonton','ottawa','winnipeg',
    'quebec-city','hamilton','kitchener','london-ontario','victoria','halifax',
    'saskatoon','regina','sherbrooke','barrie','kelowna','abbotsford',
    'kingston','fredericton','sudbury','thunder-bay','whitehorse',
  ],
  'germany': [
    'berlin','hamburg','munich','cologne','frankfurt','stuttgart','dusseldorf',
    'dortmund','essen','leipzig','bremen','dresden','hannover','nuremberg',
    'duisburg','bochum','wuppertal','bielefeld','bonn','munster','karlsruhe',
    'mannheim','augsburg','wiesbaden','gelsenkirchen','monchengladbach',
    'braunschweig','chemnitz','kiel','aachen','halle','magdeburg','freiburg',
    'krefeld','lubeck','oberhausen','erfurt','mainz','rostock',
  ],
  'france': [
    'paris','marseille','lyon','toulouse','nice','nantes','strasbourg',
    'montpellier','bordeaux','lille','rennes','reims','le-havre','saint-etienne',
    'toulon','grenoble','dijon','angers','nimes','villeurbanne','clermont-ferrand',
    'le-mans','aix-en-provence','brest','tours','amiens','limoges','perpignan',
    'metz','besancon','orleans','rouen','mulhouse','caen','nancy',
  ],
  'uae': [
    'dubai','abu-dhabi','sharjah','al-ain','ajman','ras-al-khaimah',
    'fujairah','umm-al-quwain','khor-fakkan','kalba',
  ],
  'singapore': ['singapore','jurong','woodlands','tampines','queenstown','ang-mo-kio','bedok'],
  'south-africa': [
    'johannesburg','cape-town','durban','pretoria','port-elizabeth','bloemfontein',
    'east-london','pietermaritzburg','polokwane','nelspruit','kimberley',
    'rustenburg','george','witbank','vanderbijlpark',
  ],
  'netherlands': [
    'amsterdam','rotterdam','the-hague','utrecht','eindhoven','tilburg',
    'groningen','almere','breda','nijmegen','enschede','haarlem','arnhem',
    'zaandam','haarlemmermeer','apeldoorn','hertogenbosch','amersfoort',
    'maastricht','dordrecht','leiden','zoetermeer',
  ],
  'brazil': [
    'sao-paulo','rio-de-janeiro','brasilia','salvador','fortaleza','belo-horizonte',
    'manaus','curitiba','recife','porto-alegre','goiania','belem','guarulhos',
    'campinas','sao-luis','maceio','natal','teresina','campo-grande','joao-pessoa',
    'florianopolis','santo-andre','osasco','ribeirao-preto','uberlandia',
  ],
  'mexico': [
    'mexico-city','guadalajara','monterrey','puebla','tijuana','leon',
    'juarez','torreon','queretaro','san-luis-potosi','merida','mexicali',
    'aguascalientes','hermosillo','saltillo','morelia','culiacan','acapulco',
    'cancun','veracruz','chihuahua','zapopan','nezahualcoyotl','naucalpan',
  ],
  'japan': [
    'tokyo','yokohama','osaka','nagoya','sapporo','fukuoka','kobe','kyoto',
    'kawasaki','saitama','hiroshima','sendai','kitakyushu','chiba','sakai',
    'niigata','hamamatsu','kumamoto','sagamihara','shizuoka','okayama',
    'kagoshima','funabashi','hachioji','matsuyama',
  ],
  'new-zealand': [
    'auckland','wellington','christchurch','hamilton','tauranga','napier',
    'dunedin','palmerston-north','nelson','rotorua','hastings','invercargill',
    'whangarei','new-plymouth','whanganui',
  ],
  'italy': [
    'rome','milan','naples','turin','palermo','genoa','bologna','florence',
    'bari','catania','venice','verona','messina','padua','trieste','taranto',
    'brescia','prato','reggio-calabria','modena','perugia','livorno','ravenna',
    'cagliari','foggia','rimini','salerno','ferrara','syracuse','bergamo',
  ],
  'spain': [
    'madrid','barcelona','valencia','seville','zaragoza','malaga','murcia',
    'palma','las-palmas','bilbao','alicante','cordoba','valladolid','vigo',
    'gijon','hospitalet','vitoria','granada','elche','oviedo','badalona',
    'cartagena','terrassa','jerez-de-la-frontera','sabadell','santa-cruz',
    'pamplona','almeria','leganes','san-sebastian',
  ],
  'china': [
    'shanghai','beijing','guangzhou','shenzhen','tianjin','chengdu','wuhan',
    'chongqing','hangzhou','nanjing','xi-an','shenyang','dongguan','qingdao',
    'zhengzhou','foshan','harbin','dalian','fuzhou','kunming','changsha',
    'ningbo','suzhou','jinan','hefei','urumqi','changchun','guiyang',
    'nanchang','lanzhou','taiyuan','xiamen','wenzhou',
  ],
  'south-korea': [
    'seoul','busan','incheon','daegu','daejeon','gwangju','suwon','ulsan',
    'changwon','seongnam','goyang','yongin','bucheon','ansan','cheongju',
    'jeonju','cheonan','anyang','namyangju','hwaseong',
  ],
  'malaysia': [
    'kuala-lumpur','george-town','ipoh','johor-bahru','petaling-jaya','shah-alam',
    'subang-jaya','klang','ampang-jaya','kota-kinabalu','kuching','iskandar-puteri',
    'malacca-city','alor-setar','miri','seremban','sandakan','sibu',
  ],
  'indonesia': [
    'jakarta','surabaya','bandung','medan','bekasi','tangerang','depok',
    'semarang','palembang','makassar','batam','bogor','pekanbaru','bandar-lampung',
    'padang','malang','yogyakarta','denpasar','samarinda','pontianak',
  ],
  'thailand': [
    'bangkok','chiang-mai','pattaya','hat-yai','nonthaburi','pak-kret',
    'udon-thani','nakhon-ratchasima','khon-kaen','chiang-rai','ubon-ratchathani',
    'nakhon-sawan','rayong','chonburi','songkhla','phuket',
  ],
  'vietnam': [
    'ho-chi-minh-city','hanoi','da-nang','hai-phong','can-tho','bien-hoa',
    'hue','nha-trang','thu-duc','buon-ma-thuot','quy-nhon','vinh','da-lat',
    'long-xuyen','rach-gia','vung-tau',
  ],
  'philippines': [
    'manila','quezon-city','caloocan','davao','cebu','zamboanga','antipolo',
    'pasig','taguig','valenzuela','cagayan-de-oro','parañaque','makati',
    'bacolod','general-santos','mandaue','marikina','nasugbu',
  ],
  'nigeria': [
    'lagos','kano','ibadan','abuja','port-harcourt','benin-city','maiduguri',
    'zaria','aba','jos','ilorin','oyo','enugu','abeokuta','onitsha',
    'warri','kaduna','sokoto','calabar','uyo',
  ],
  'kenya': [
    'nairobi','mombasa','kisumu','nakuru','eldoret','ruiru','kikuyu',
    'nyeri','machakos','malindi','kitale','garissa','kakamega','thika',
  ],
  'egypt': [
    'cairo','alexandria','giza','shubra-el-kheima','port-said','suez',
    'luxor','aswan','el-mahalla','tanta','asyut','ismailia','fayyum',
    'zagazig','damietta','hurghada','mansoura','beni-suef',
  ],
  'saudi-arabia': [
    'riyadh','jeddah','mecca','medina','dammam','al-khobar','tabuk',
    'buraidah','khamis-mushait','hail','hofuf','ta-if','yanbu','abha',
    'jubail','dhahran','al-qatif','al-jubail',
  ],
  'qatar': [
    'doha','al-rayyan','al-wakrah','al-khor','al-shahaniya','dukhan',
    'madinat-ash-shamal','mesaieed',
  ],
  'sweden': [
    'stockholm','gothenburg','malmo','uppsala','vasteras','orebro','linkoping',
    'helsingborg','jonkoping','norrkoping','lund','umea','gavle','boras',
    'sodertale','eskilstuna','karlstad','sundsvall','vasteras','halmstad',
  ],
  'norway': [
    'oslo','bergen','trondheim','stavanger','drammen','fredrikstad','kristiansand',
    'sandnes','tromso','sarpsborg','skien','alesund','sandefjord','haugesund',
  ],
  'denmark': [
    'copenhagen','aarhus','odense','aalborg','esbjerg','randers','kolding',
    'horsens','vejle','roskilde','herning','helsingore','silkeborg','naestved',
  ],
  'finland': [
    'helsinki','espoo','tampere','vantaa','oulu','turku','jyvaskyla',
    'lahti','kuopio','pori','kouvola','joensuu','lappeenranta','hameenlinna',
  ],
  'switzerland': [
    'zurich','geneva','basel','bern','lausanne','winterthur','lucerne',
    'st-gallen','lugano','biel','thun','koniz','la-chaux-de-fonds','fribourg',
  ],
  'austria': [
    'vienna','graz','linz','salzburg','innsbruck','klagenfurt','villach',
    'wels','st-polten','dornbirn','wiener-neustadt','steyr','leonding',
  ],
  'belgium': [
    'brussels','antwerp','ghent','charleroi','liege','bruges','namur',
    'leuven','mons','aalst','mechelen','la-louviere','kortrijk','hasselt',
  ],
  'poland': [
    'warsaw','krakow','lodz','wroclaw','poznan','gdansk','szczecin',
    'bydgoszcz','lublin','katowice','bialystok','gdynia','czestochowa',
    'radom','sosnowiec','torun','kielce','rzeszow','gliwice','zabrze',
  ],
  'turkey': [
    'istanbul','ankara','izmir','bursa','adana','gaziantep','konya',
    'antalya','kayseri','mersin','diyarbakir','samsun','denizli','eskisehir',
    'urfa','malatya','gebze','erzurum','adapazari','kahramanmaras',
  ],
  'israel': [
    'jerusalem','tel-aviv','haifa','rishon-lezion','petah-tikva','ashdod',
    'netanya','beer-sheva','holon','bnei-brak','ramat-gan','rehovot',
    'herzliya','bat-yam','kfar-saba',
  ],
  'argentina': [
    'buenos-aires','cordoba','rosario','mendoza','la-plata','san-miguel',
    'mar-del-plata','quilmes','salta','santa-fe','san-juan','resistencia',
    'santiago-del-estero','corrientes','tucuman',
  ],
  'chile': [
    'santiago','valparaiso','concepcion','la-serena','antofagasta','temuco',
    'rancagua','talca','arica','puerto-montt','iquique','coquimbo',
  ],
  'colombia': [
    'bogota','medellin','cali','barranquilla','cartagena','cucuta','bucaramanga',
    'pereira','santa-marta','ibague','manizales','villavicencio','pasto',
  ],
  'peru': [
    'lima','arequipa','trujillo','chiclayo','piura','iquitos','cusco',
    'chimbote','huancayo','tacna','pucallpa','juliaca',
  ],
  'bangladesh': [
    'dhaka','chittagong','sylhet','rajshahi','khulna','comilla','barisal',
    'mymensingh','jessore','narayanganj','gazipur',
  ],
  'pakistan': [
    'karachi','lahore','faisalabad','rawalpindi','gujranwala','islamabad',
    'peshawar','quetta','multan','hyderabad','sialkot','bahawalpur',
    'sargodha','sheikhupura','sukkur',
  ],
  'sri-lanka': [
    'colombo','kandy','galle','jaffna','negombo','trincomalee','anuradhapura',
    'ratnapura','batticaloa','matara',
  ],
  'myanmar': ['yangon','mandalay','naypyidaw','mawlamyine','bago','pathein','monywa'],
  'cambodia': ['phnom-penh','siem-reap','battambang','sihanoukville','kampong-cham'],
  'ghana': ['accra','kumasi','tamale','sekondi','cape-coast','obuasi','sunyani'],
};

/** Build a flat lookup: citySlug → { name, country } */
const CITY_SLUG_MAP = {};
for (const [countrySlug, cities] of Object.entries(CITIES_BY_COUNTRY)) {
  const countryName = COUNTRY_SLUG_MAP[countrySlug];
  for (const citySlug of cities) {
    const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    CITY_SLUG_MAP[citySlug] = { name: cityName, country: countrySlug, countryName };
  }
}

/** Get all city slugs for a given country slug */
export function getCitiesForCountry(countrySlug) {
  return CITIES_BY_COUNTRY[countrySlug] || [];
}

/** Get all country slugs that have cities defined */
export const COUNTRIES_WITH_CITIES = Object.keys(CITIES_BY_COUNTRY);

/** Convert city slug → { name, country, countryName } or null */
export function citySlugToInfo(slug) {
  return CITY_SLUG_MAP[slug?.toLowerCase()] || null;
}

/** Convert country slug to display name. Returns null if not found. */
export function countrySlugToName(slug) {
  return COUNTRY_SLUG_MAP[slug?.toLowerCase()] || null;
}

/** Convert a kebab-case slug to Title Case */
export function slugToTitle(slug) {
  return (slug || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Page title for country/state/city page */
export function getSearchPageTitle(categoryName, locationName) {
  return `Top 10 ${categoryName} Companies in ${locationName} (${SEO_YEAR})`;
}

/** Page meta description */
export function getSearchPageDescription(categoryName, locationName) {
  return `Discover the top ${categoryName} companies in ${locationName} (${SEO_YEAR}). Browse verified ${categoryName.toLowerCase()} service providers, compare expertise, pricing, and reviews to find the best partner for your needs.`;
}

/** Total city count across all countries */
export const TOTAL_CITIES = Object.values(CITIES_BY_COUNTRY).reduce((s, arr) => s + arr.length, 0);

// ─── STATES & CITIES ──────────────────────────────────────────────────────────
// Format: { countrySlug: { stateSlug: { name, cities: [citySlug, ...] } } }

export const STATES_BY_COUNTRY = {

  // ── INDIA ──────────────────────────────────────────────────────────────────
  india: {
    'gujarat': { name: 'Gujarat', cities: [
      'ahmedabad','surat','vadodara','rajkot','bhavnagar','jamnagar','junagadh',
      'gandhinagar','anand','nadiad','morbi','surendranagar','mehsana','bharuch',
      'navsari','valsad','porbandar','amreli','botad','dahod','patan','palanpur',
      'godhra','ankleshwar','veraval','dwarka','somnath','bhuj','modasa',
      'himatnagar','deesa','gondal','jetpur','wankaner','visnagar','unjha',
      'sidhpur','idar','dhoraji','upleta','mahuva','talaja','palitana','ghogha',
      'mithapur','okha','salaya','khambhat','petlad','anklav','kapadvanj',
      'balasinor','dakor','umreth','karjan','jambusar','hansot','olpad',
      'bardoli','mandvi','mundra','gandhidham','adipur','anjar','rapar',
      'morbi','wankaner','halvad','limbdi','chotila','dhrangadhra','dasada',
    ]},
    'maharashtra': { name: 'Maharashtra', cities: [
      'mumbai','pune','nagpur','nashik','aurangabad','solapur','amravati',
      'kolhapur','sangli','satara','ratnagiri','latur','nanded','jalgaon',
      'akola','dhule','nandurbar','yavatmal','washim','buldhana','chandrapur',
      'gadchiroli','gondia','wardha','bhandara','thane','navi-mumbai',
      'pimpri-chinchwad','kalyan','dombivli','vasai-virar','ulhasnagar',
      'bhiwandi','malegaon','ahmednagar','jalna','osmanabad','parbhani',
      'hingoli','bid','raigad','sindhudurg','alibag','pen','panvel',
    ]},
    'karnataka': { name: 'Karnataka', cities: [
      'bangalore','mysuru','mangalore','hubli','dharwad','belgaum','gulbarga',
      'bidar','vijayapura','davanagere','bellary','shivamogga','tumkur',
      'raichur','udupi','hassan','chitradurga','mandya','kolar','chikmagalur',
      'kodagu','bagalkot','koppal','gadag','haveri','uttara-kannada','yadgir',
      'chamarajanagar','bangalore-rural','ramanagara','chikkaballapura',
    ]},
    'tamil-nadu': { name: 'Tamil Nadu', cities: [
      'chennai','coimbatore','madurai','tiruchirappalli','salem','tirunelveli',
      'erode','tiruppur','vellore','thoothukudi','dindigul','thanjavur',
      'ranipet','sivakasi','karur','cuddalore','kancheepuram','villupuram',
      'nagapattinam','tiruvannamalai','namakkal','perambalur','ariyalur',
      'pudukkottai','ramanathapuram','virudhunagar','theni','krishnagiri',
      'dharmapuri','nilgiris','tiruvarur','kallakurichi','chengalpattu',
    ]},
    'andhra-pradesh': { name: 'Andhra Pradesh', cities: [
      'visakhapatnam','vijayawada','guntur','nellore','kurnool','rajahmundry',
      'kakinada','kadapa','tirupati','anantapur','eluru','ongole','vizianagaram',
      'srikakulam','bhimavaram','machilipatnam','tenali','chittoor','hindupur',
      'adoni','proddatur','nandyal','tadipatri','guntakal','dhone',
    ]},
    'telangana': { name: 'Telangana', cities: [
      'hyderabad','warangal','nizamabad','khammam','karimnagar','ramagundam',
      'mahbubnagar','nalgonda','adilabad','suryapet','miryalaguda','siddipet',
      'jagtial','mancherial','nirmal','kamareddy','wanaparthy','nagarkurnool',
      'narayanpet','sangareddy','medak','vikarabad','yadadri-bhuvanagiri',
    ]},
    'rajasthan': { name: 'Rajasthan', cities: [
      'jaipur','jodhpur','kota','bikaner','udaipur','ajmer','bhilwara',
      'alwar','bharatpur','sikar','pali','sri-ganganagar','sriganganagar',
      'hanumangarh','jhunjhunu','churu','barmer','jaisalmer','nagaur',
      'tonk','sawai-madhopur','karauli','dausa','dholpur','baran','jhalawar',
      'bundi','rajsamand','dungarpur','banswara','pratapgarh','chittorgarh',
    ]},
    'madhya-pradesh': { name: 'Madhya Pradesh', cities: [
      'bhopal','indore','jabalpur','gwalior','ujjain','sagar','ratlam',
      'satna','rewa','murwara','singrauli','burhanpur','khandwa','bhind',
      'chhindwara','guna','shivpuri','vidisha','chhatarpur','damoh',
      'mandsaur','khargone','neemuch','pithampur','hoshangabad','itarsi',
      'sehore','raisen','dewas','datia','tikamgarh','panna','seoni',
    ]},
    'uttar-pradesh': { name: 'Uttar Pradesh', cities: [
      'lucknow','kanpur','agra','varanasi','meerut','allahabad','prayagraj',
      'ghaziabad','bareilly','aligarh','moradabad','saharanpur','gorakhpur',
      'noida','firozabad','loni','jhansi','muzaffarnagar','mathura','shahjahanpur',
      'rampur','shivaji-nagar','farrukhabad','mau','hapur','etawah','mirzapur',
      'bulandshahr','sambhal','amroha','hardoi','sitapur','jaunpur','gonda',
      'faizabad','ayodhya','bahraich','ballia','unnao','fatehpur',
    ]},
    'west-bengal': { name: 'West Bengal', cities: [
      'kolkata','howrah','durgapur','asansol','siliguri','bardhaman','maheshtala',
      'rajpur-sonarpur','south-dumdum','behala','north-dumdum','bally',
      'panihati','kharagpur','haldia','krishnanagar','raiganj','inglish-bazar',
      'domjur','uluberia','chandannagar','santipur','bankura','purulia',
      'berhampore','jalpaiguri','cooch-behar','darjeeling','alipurduar',
    ]},
    'delhi': { name: 'Delhi', cities: [
      'new-delhi','central-delhi','north-delhi','south-delhi','east-delhi',
      'west-delhi','north-west-delhi','south-west-delhi','north-east-delhi',
      'shahdara','dwarka','rohini','pitampura','janakpuri','lajpat-nagar',
      'connaught-place','karol-bagh','saket','vasant-kunj','nehru-place',
    ]},
    'punjab': { name: 'Punjab', cities: [
      'ludhiana','amritsar','jalandhar','patiala','bathinda','hoshiarpur',
      'mohali','batala','pathankot','moga','abohar','malerkotla','khanna',
      'phagwara','muktsar','barnala','rajpura','firozpur','sangrur','faridkot',
      'fazilka','gurdaspur','kapurthala','nawanshahr','rup-nagar','tarn-taran',
    ]},
    'haryana': { name: 'Haryana', cities: [
      'faridabad','gurgaon','panipat','ambala','yamunanagar','rohtak',
      'hisar','karnal','sonipat','panchkula','bhiwani','sirsa','bahadurgarh',
      'jind','thanesar','kaithal','rewari','palwal','narnaul','fatehabad',
      'mewat','nuh','jhajjar','mahendragarh','charkhi-dadri',
    ]},
    'kerala': { name: 'Kerala', cities: [
      'kochi','thiruvananthapuram','kozhikode','thrissur','kollam','palakkad',
      'alappuzha','malappuram','kannur','kottayam','kasaragod','pathanamthitta',
      'idukki','wayanad','ernakulam','munnar','guruvayur','thalassery',
      'vatakara','manjeri','tirur','ponnani','perinthalmanna','ottapalam',
    ]},
    'odisha': { name: 'Odisha', cities: [
      'bhubaneswar','cuttack','rourkela','brahmapur','sambalpur','puri',
      'balasore','bhadrak','baripada','jharsuguda','jeypore','angul',
      'dhenkanal','kendujhar','paradip','barbil','rayagada','koraput',
    ]},
    'assam': { name: 'Assam', cities: [
      'guwahati','silchar','dibrugarh','jorhat','nagaon','tinsukia',
      'tezpur','bongaigaon','dhubri','diphu','north-lakhimpur','karimganj',
      'hailakandi','goalpara','sivsagar','golaghat','kokrajhar','dhemaji',
    ]},
    'bihar': { name: 'Bihar', cities: [
      'patna','gaya','muzaffarpur','bhagalpur','darbhanga','arrah','begusarai',
      'katihar','munger','chhapra','purnia','bettiah','hajipur','sasaram',
      'siwan','aurangabad','nawada','jehanabad','supaul','saharsa','madhubani',
    ]},
    'chhattisgarh': { name: 'Chhattisgarh', cities: [
      'raipur','bhilai','durg','bilaspur','korba','rajnandgaon','jagdalpur',
      'raigarh','ambikapur','mahasamund','dhamtari','kabirdham','kondagaon',
    ]},
    'jharkhand': { name: 'Jharkhand', cities: [
      'ranchi','jamshedpur','dhanbad','bokaro-steel-city','deoghar','phusro',
      'hazaribagh','giridih','ramgarh','medininagar','chatra','gumla',
    ]},
    'himachal-pradesh': { name: 'Himachal Pradesh', cities: [
      'shimla','dharamshala','solan','mandi','palampur','baddi','nahan',
      'kullu','manali','bilaspur','hamirpur','una','chamba','kangra',
    ]},
    'uttarakhand': { name: 'Uttarakhand', cities: [
      'dehradun','haridwar','roorkee','haldwani','rudrapur','kashipur',
      'rishikesh','kotdwar','ramnagar','almora','pithoragarh','bageshwar',
      'champawat','nainital','udham-singh-nagar','tehri-garhwal',
    ]},
    'goa': { name: 'Goa', cities: [
      'panaji','margao','vasco-da-gama','mapusa','ponda','bicholim',
      'curchorem','sanquelim','pernem','quepem','canacona',
    ]},
    'manipur': { name: 'Manipur', cities: ['imphal','thoubal','bishnupur','churachandpur','senapati','ukhrul'] },
    'meghalaya': { name: 'Meghalaya', cities: ['shillong','tura','nongstoin','jowai','baghmara','williamnagar'] },
    'nagaland': { name: 'Nagaland', cities: ['kohima','dimapur','mokokchung','tuensang','wokha','zunheboto'] },
    'tripura': { name: 'Tripura', cities: ['agartala','dharmanagar','udaipur','kailashahar','belonia','ambassa'] },
    'mizoram': { name: 'Mizoram', cities: ['aizawl','lunglei','saiha','champhai','kolasib','serchhip'] },
    'sikkim': { name: 'Sikkim', cities: ['gangtok','namchi','geyzing','mangan','ravangla'] },
    'arunachal-pradesh': { name: 'Arunachal Pradesh', cities: ['itanagar','naharlagun','pasighat','tezpur-ap','bomdila','ziro'] },
    'chandigarh': { name: 'Chandigarh', cities: ['chandigarh','panchkula-ch','mohali-ch'] },
    'ladakh': { name: 'Ladakh', cities: ['leh','kargil'] },
    'jammu-kashmir': { name: 'Jammu & Kashmir', cities: ['srinagar','jammu','anantnag','baramulla','sopore','kathua','udhampur','rajouri','poonch'] },
  },

  // ── UNITED STATES ─────────────────────────────────────────────────────────
  'united-states': {
    'california': { name: 'California', cities: [
      'los-angeles','san-francisco','san-diego','san-jose','fresno','sacramento',
      'long-beach','oakland','bakersfield','anaheim','santa-ana','riverside',
      'stockton','chula-vista','fremont','irvine','san-bernardino','modesto',
      'fontana','moreno-valley','glendale','huntington-beach','santa-clarita',
      'garden-grove','oceanside','rancho-cucamonga','santa-rosa','ontario',
      'elk-grove','corona','hayward','salinas','pomona','torrance','pasadena',
    ]},
    'texas': { name: 'Texas', cities: [
      'houston','san-antonio','dallas','austin','fort-worth','el-paso',
      'arlington','corpus-christi','plano','lubbock','laredo','irving',
      'garland','frisco','amarillo','grand-prairie','mckinney','brownsville',
      'killeen','pasadena','mesquite','mcallen','waco','carrollton','midland',
      'denton','abilene','beaumont','odessa','round-rock','richardson',
    ]},
    'new-york': { name: 'New York', cities: [
      'new-york-city','buffalo','rochester','yonkers','syracuse','albany',
      'new-rochelle','mount-vernon','schenectady','utica','white-plains',
      'hempstead','troy','niagara-falls','binghamton','freeport','valley-stream',
    ]},
    'florida': { name: 'Florida', cities: [
      'jacksonville','miami','tampa','orlando','st-petersburg','hialeah',
      'tallahassee','fort-lauderdale','port-st-lucie','cape-coral','pembroke-pines',
      'hollywood','miramar','gainesville','coral-springs','miami-gardens',
      'clearwater','palm-bay','west-palm-beach','pompano-beach','lakeland',
    ]},
    'illinois': { name: 'Illinois', cities: [
      'chicago','aurora','joliet','naperville','rockford','springfield',
      'elgin','peoria','champaign','waukegan','cicero','bloomington',
      'decatur','evanston','des-plaines','berwyn','orland-park','tinley-park',
    ]},
    'pennsylvania': { name: 'Pennsylvania', cities: [
      'philadelphia','pittsburgh','allentown','erie','reading','scranton',
      'bethlehem','lancaster','harrisburg','york','wilkes-barre','state-college',
    ]},
    'ohio': { name: 'Ohio', cities: [
      'columbus','cleveland','cincinnati','toledo','akron','dayton',
      'parma','canton','youngstown','lorain','hamilton','springfield',
      'kettering','elyria','lakewood','cuyahoga-falls','mentor','euclid',
    ]},
    'georgia': { name: 'Georgia', cities: [
      'atlanta','columbus-ga','savannah','athens','sandy-springs','roswell',
      'macon','johns-creek','albany-ga','warner-robins','alpharetta',
      'marietta','smyrna','valdosta','brookhaven','dunwoody','rome-ga',
    ]},
    'michigan': { name: 'Michigan', cities: [
      'detroit','grand-rapids','warren','sterling-heights','ann-arbor','lansing',
      'flint','dearborn','livonia','westland','troy-mi','farmington-hills',
      'kalamazoo','wyoming','southfield','rochester-hills','pontiac','saginaw',
    ]},
    'washington': { name: 'Washington', cities: [
      'seattle','spokane','tacoma','vancouver-wa','bellevue','kent','everett',
      'renton','spokane-valley','federal-way','kirkland','bellingham',
      'kennewick','yakima','redmond','marysville','pasco','richland',
    ]},
    'arizona': { name: 'Arizona', cities: [
      'phoenix','tucson','mesa','chandler','scottsdale','gilbert','glendale-az',
      'tempe','peoria-az','surprise','yuma','avondale','goodyear','flagstaff',
      'casas-adobes','lake-havasu-city','buckeye','maricopa',
    ]},
    'massachusetts': { name: 'Massachusetts', cities: [
      'boston','worcester','springfield-ma','cambridge','lowell','brockton',
      'new-bedford','quincy','lynn','fall-river','newton','somerville',
      'lawrence','waltham','haverhill','malden','medford','taunton',
    ]},
    'colorado': { name: 'Colorado', cities: [
      'denver','colorado-springs','aurora','fort-collins','lakewood-co','thornton',
      'arvada','westminster-co','pueblo','centennial','boulder','highlands-ranch',
      'greeley','longmont','loveland','broomfield','castle-rock',
    ]},
    'nevada': { name: 'Nevada', cities: [
      'las-vegas','henderson','reno','north-las-vegas','sparks','carson-city',
      'enterprise','sunrise-manor','spring-valley','winchester','summerlin',
    ]},
    'north-carolina': { name: 'North Carolina', cities: [
      'charlotte','raleigh','greensboro','durham','winston-salem','fayetteville',
      'cary','wilmington','high-point','concord-nc','greenville-nc','asheville',
      'gastonia','jacksonville-nc','chapel-hill','apex','huntersville',
    ]},
  },

  // ── UNITED KINGDOM ────────────────────────────────────────────────────────
  'united-kingdom': {
    'england': { name: 'England', cities: [
      'london','birmingham','manchester','leeds','sheffield','bradford',
      'liverpool','bristol','coventry','nottingham','newcastle','sunderland',
      'brighton','hull','derby','stoke-on-trent','wolverhampton','plymouth',
      'southampton','reading','oxford','cambridge','york','portsmouth',
      'milton-keynes','exeter','norwich','luton','middlesbrough','chester',
      'bath','salisbury','leicester','gloucester','swindon','peterborough',
      'blackpool','bolton','derby','ipswich','worcester','carlisle',
    ]},
    'scotland': { name: 'Scotland', cities: [
      'glasgow','edinburgh','aberdeen','dundee','inverness','perth','stirling',
      'livingston','east-kilbride','hamilton','cumbernauld','ayr','kilmarnock',
      'dunfermline','kirkcaldy','glenrothes','coatbridge','motherwell',
    ]},
    'wales': { name: 'Wales', cities: [
      'cardiff','swansea','newport','wrexham','barry','neath','bridgend',
      'cwmbran','llanelli','caerphilly','merthyr-tydfil','aberystwyth','rhyl',
    ]},
    'northern-ireland': { name: 'Northern Ireland', cities: [
      'belfast','derry','lisburn','newry','armagh','ballymena','coleraine',
      'omagh','enniskillen','strabane','dungannon','limavady',
    ]},
  },

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  'australia': {
    'new-south-wales': { name: 'New South Wales', cities: [
      'sydney','newcastle','wollongong','maitland','coffs-harbour','wagga-wagga',
      'albury','port-macquarie','tamworth','orange','dubbo','bathurst',
      'lismore','nowra','queanbeyan','cessnock','penrith','blacktown',
      'parramatta','bankstown','liverpool-nsw','campbelltown','gosford',
    ]},
    'victoria': { name: 'Victoria', cities: [
      'melbourne','geelong','ballarat','bendigo','shepparton','latrobe',
      'mildura','wodonga','warrnambool','portland-vic','horsham','bairnsdale',
      'traralgon','morwell','sale-vic','wangaratta','hamilton-vic','ararat',
    ]},
    'queensland': { name: 'Queensland', cities: [
      'brisbane','gold-coast','sunshine-coast','townsville','cairns','toowoomba',
      'rockhampton','mackay','bundaberg','hervey-bay','gladstone','maryborough',
      'noosa','ipswich','logan','redland','moreton-bay',
    ]},
    'western-australia': { name: 'Western Australia', cities: [
      'perth','bunbury','albany','geraldton','kalgoorlie','broome','port-hedland',
      'karratha','mandurah','rockingham','fremantle','joondalup','stirling-wa',
    ]},
    'south-australia': { name: 'South Australia', cities: [
      'adelaide','mount-gambier','whyalla','port-augusta','port-pirie',
      'murray-bridge','victor-harbor','gawler','elizabeth','salisbury-sa',
    ]},
    'tasmania': { name: 'Tasmania', cities: [
      'hobart','launceston','devonport','burnie','ulverstone','kingston-tas',
    ]},
    'australian-capital-territory': { name: 'Australian Capital Territory', cities: ['canberra'] },
    'northern-territory': { name: 'Northern Territory', cities: ['darwin','alice-springs','palmerston'] },
  },

  // ── CANADA ────────────────────────────────────────────────────────────────
  'canada': {
    'ontario': { name: 'Ontario', cities: [
      'toronto','ottawa','mississauga','brampton','hamilton-on','london-on',
      'markham','vaughan','kitchener','windsor','burlington','oshawa',
      'barrie','kingston-on','cambridge-on','greater-sudbury','guelph',
      'thunder-bay','waterloo','ajax','pickering','whitby','newmarket',
    ]},
    'quebec': { name: 'Quebec', cities: [
      'montreal','quebec-city','laval','longueuil','gatineau','sherbrooke',
      'saguenay','levis','trois-rivieres','saint-jean-sur-richelieu',
      'brossard','saint-jerome','saint-hyacinthe','beloeil',
    ]},
    'british-columbia': { name: 'British Columbia', cities: [
      'vancouver','surrey','burnaby','richmond','kelowna','abbotsford',
      'coquitlam','langley','delta-bc','kamloops','prince-george',
      'nanaimo','victoria-bc','chilliwack','maple-ridge',
    ]},
    'alberta': { name: 'Alberta', cities: [
      'calgary','edmonton','red-deer','lethbridge','medicine-hat','airdrie',
      'st-albert','grande-prairie','spruce-grove','fort-mcmurray','lloydminster',
    ]},
    'manitoba': { name: 'Manitoba', cities: ['winnipeg','brandon','steinbach','thompson','portage-la-prairie'] },
    'saskatchewan': { name: 'Saskatchewan', cities: ['saskatoon','regina','prince-albert','moose-jaw','yorkton'] },
    'nova-scotia': { name: 'Nova Scotia', cities: ['halifax','sydney-ns','truro','new-glasgow','amherst'] },
    'new-brunswick': { name: 'New Brunswick', cities: ['fredericton','saint-john','moncton','miramichi','bathurst-nb'] },
  },

  // ── GERMANY ───────────────────────────────────────────────────────────────
  'germany': {
    'bavaria': { name: 'Bavaria', cities: [
      'munich','nuremberg','augsburg','regensburg','ingolstadt','wurzburg',
      'fürth','erlangen','bayreuth','bamberg','landshut','rosenheim',
    ]},
    'north-rhine-westphalia': { name: 'North Rhine-Westphalia', cities: [
      'cologne','dusseldorf','dortmund','essen','duisburg','bochum','wuppertal',
      'bielefeld','bonn','munster','krefeld','oberhausen','aachen','gelsenkirchen',
      'monchengladbach','hagen','hamm','solingen','leverkusen','siegen',
    ]},
    'berlin': { name: 'Berlin', cities: ['berlin','mitte','charlottenburg','pankow','spandau','steglitz'] },
    'hamburg': { name: 'Hamburg', cities: ['hamburg','harburg','wandsbek','bergedorf','altona'] },
    'saxony': { name: 'Saxony', cities: ['dresden','leipzig','chemnitz','zwickau','plauen','gorlitz'] },
    'hesse': { name: 'Hesse', cities: ['frankfurt','wiesbaden','kassel','darmstadt','offenbach','hanau','marburg'] },
    'baden-wurttemberg': { name: 'Baden-Württemberg', cities: [
      'stuttgart','karlsruhe','mannheim','freiburg','heidelberg','ulm',
      'heilbronn','pforzheim','reutlingen','ludwigsburg','esslingen',
    ]},
    'lower-saxony': { name: 'Lower Saxony', cities: ['hannover','braunschweig','osnabrück','wolfsburg','gottingen','salzgitter'] },
  },

  // ── UAE ───────────────────────────────────────────────────────────────────
  'uae': {
    'dubai': { name: 'Dubai', cities: ['dubai-city','deira','bur-dubai','jumeirah','business-bay','downtown-dubai','marina','jlt','dip','jebel-ali'] },
    'abu-dhabi': { name: 'Abu Dhabi', cities: ['abu-dhabi-city','al-ain','ruwais','mussafah','khalifa-city','shahama'] },
    'sharjah': { name: 'Sharjah', cities: ['sharjah-city','khor-fakkan','kalba','dibba-al-hisn'] },
    'ajman': { name: 'Ajman', cities: ['ajman-city','masfout'] },
    'ras-al-khaimah': { name: 'Ras Al Khaimah', cities: ['ras-al-khaimah-city','al-jazirah-al-hamra'] },
    'fujairah': { name: 'Fujairah', cities: ['fujairah-city','dibba-al-fujairah'] },
  },

};

/** Get all states for a country */
export function getStatesForCountry(countrySlug) {
  return STATES_BY_COUNTRY[countrySlug] || null;
}

/** Convert state slug → { name, cities } for a given country */
export function stateSlugToInfo(countrySlug, stateSlug) {
  const states = STATES_BY_COUNTRY[countrySlug];
  if (!states) return null;
  const state = states[stateSlug];
  if (!state) return null;
  return { ...state, slug: stateSlug };
}

/** Get cities for a state */
export function getCitiesForState(countrySlug, stateSlug) {
  const info = stateSlugToInfo(countrySlug, stateSlug);
  return info ? info.cities : [];
}
