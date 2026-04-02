const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// ─── Static blog slugs ──────────────────────────────────────────────────────
const BLOG_SLUGS = [
  'best-specialty-chemical-companies-australia-2026',
  'best-solar-panels-australia-2026',
  'top-10-stabilizer-brands-india-2026',
  'top-10-switch-socket-brands-india-2026',
  'best-solar-panel-brands-india-2026',
  'top-10-led-light-brands-india-2026',
  'top-10-water-pump-brands-india-2026',
  'top-10-drilling-machine-brands-india-2026',
  'top-10-milling-machine-manufacturers-india-2026',
  'top-10-recruitment-agencies-india-2026',
  'best-contract-staffing-agencies-india-2026',
  'best-permanent-staffing-rpo-firms-india-2026',
  'top-healthcare-staffing-agencies-ahmedabad-2026',
  'top-10-it-staffing-companies-india-2026',
  'top-industrial-staffing-companies-india-2026',
  'top-staffing-agencies-delhi-ncr-2026',
  'top-it-staffing-companies-bangalore-2026',
];

const STAFFING_SLUGS = [
  'executive-search', 'healthcare-staffing', 'it-staffing', 'temporary-staffing',
  'permanent-staffing', 'remote-staffing', 'contract-staffing',
  'hr-recruitment-services', 'technical-staffing', 'industrial-staffing',
];

const TARGET_COUNTRIES = [
  'india', 'united-states', 'united-kingdom', 'australia', 'canada',
  'germany', 'france', 'uae', 'singapore', 'south-africa',
  'netherlands', 'brazil', 'mexico', 'japan', 'new-zealand',
  'italy', 'spain', 'china', 'south-korea', 'malaysia',
  'indonesia', 'thailand', 'vietnam', 'philippines', 'nigeria',
  'kenya', 'egypt', 'saudi-arabia', 'qatar', 'turkey',
  'poland', 'sweden', 'switzerland', 'argentina', 'colombia',
  'pakistan', 'bangladesh', 'israel', 'norway', 'denmark',
];

// Slug → display name for building ?country= query params
const COUNTRY_NAMES = {
  'india': 'India', 'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'australia': 'Australia', 'canada': 'Canada', 'germany': 'Germany', 'france': 'France',
  'uae': 'UAE', 'singapore': 'Singapore', 'south-africa': 'South Africa',
  'netherlands': 'Netherlands', 'brazil': 'Brazil', 'mexico': 'Mexico', 'japan': 'Japan',
  'new-zealand': 'New Zealand', 'italy': 'Italy', 'spain': 'Spain', 'china': 'China',
  'south-korea': 'South Korea', 'malaysia': 'Malaysia', 'indonesia': 'Indonesia',
  'thailand': 'Thailand', 'vietnam': 'Vietnam', 'philippines': 'Philippines',
  'nigeria': 'Nigeria', 'kenya': 'Kenya', 'egypt': 'Egypt', 'saudi-arabia': 'Saudi Arabia',
  'qatar': 'Qatar', 'turkey': 'Turkey', 'poland': 'Poland', 'sweden': 'Sweden',
  'switzerland': 'Switzerland', 'argentina': 'Argentina', 'colombia': 'Colombia',
  'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh', 'israel': 'Israel',
  'norway': 'Norway', 'denmark': 'Denmark',
};

// State slug → display name (for key states)
const STATE_NAMES = {
  'gujarat': 'Gujarat', 'maharashtra': 'Maharashtra', 'karnataka': 'Karnataka',
  'tamil-nadu': 'Tamil Nadu', 'delhi': 'Delhi', 'uttar-pradesh': 'Uttar Pradesh',
  'rajasthan': 'Rajasthan', 'telangana': 'Telangana', 'andhra-pradesh': 'Andhra Pradesh',
  'kerala': 'Kerala', 'west-bengal': 'West Bengal', 'punjab': 'Punjab',
  'california': 'California', 'texas': 'Texas', 'new-york': 'New York',
  'florida': 'Florida', 'illinois': 'Illinois', 'pennsylvania': 'Pennsylvania',
  'massachusetts': 'Massachusetts', 'washington': 'Washington', 'georgia': 'Georgia',
  'new-jersey': 'New Jersey',
  'england': 'England', 'scotland': 'Scotland', 'wales': 'Wales',
  'new-south-wales': 'New South Wales', 'victoria': 'Victoria',
  'queensland': 'Queensland', 'western-australia': 'Western Australia',
  'ontario': 'Ontario', 'british-columbia': 'British Columbia', 'quebec': 'Quebec',
  'bavaria': 'Bavaria', 'north-rhine-westphalia': 'North Rhine-Westphalia',
  'dubai': 'Dubai',
};

// Key states per country for state-level pages
const KEY_STATES = [
  // India
  { country: 'india', state: 'gujarat' },
  { country: 'india', state: 'maharashtra' },
  { country: 'india', state: 'karnataka' },
  { country: 'india', state: 'tamil-nadu' },
  { country: 'india', state: 'delhi' },
  { country: 'india', state: 'uttar-pradesh' },
  { country: 'india', state: 'rajasthan' },
  { country: 'india', state: 'telangana' },
  { country: 'india', state: 'andhra-pradesh' },
  { country: 'india', state: 'kerala' },
  { country: 'india', state: 'west-bengal' },
  { country: 'india', state: 'punjab' },
  // USA
  { country: 'united-states', state: 'california' },
  { country: 'united-states', state: 'texas' },
  { country: 'united-states', state: 'new-york' },
  { country: 'united-states', state: 'florida' },
  { country: 'united-states', state: 'illinois' },
  { country: 'united-states', state: 'pennsylvania' },
  { country: 'united-states', state: 'massachusetts' },
  { country: 'united-states', state: 'washington' },
  { country: 'united-states', state: 'georgia' },
  { country: 'united-states', state: 'new-jersey' },
  // UK
  { country: 'united-kingdom', state: 'england' },
  { country: 'united-kingdom', state: 'scotland' },
  { country: 'united-kingdom', state: 'wales' },
  // Australia
  { country: 'australia', state: 'new-south-wales' },
  { country: 'australia', state: 'victoria' },
  { country: 'australia', state: 'queensland' },
  { country: 'australia', state: 'western-australia' },
  // Canada
  { country: 'canada', state: 'ontario' },
  { country: 'canada', state: 'british-columbia' },
  { country: 'canada', state: 'quebec' },
  // Germany
  { country: 'germany', state: 'bavaria' },
  { country: 'germany', state: 'north-rhine-westphalia' },
];

// Key cities for city-level pages
const KEY_CITIES = [
  // India
  { country: 'india', state: 'gujarat',         city: 'ahmedabad' },
  { country: 'india', state: 'gujarat',         city: 'surat' },
  { country: 'india', state: 'gujarat',         city: 'vadodara' },
  { country: 'india', state: 'gujarat',         city: 'rajkot' },
  { country: 'india', state: 'maharashtra',     city: 'mumbai' },
  { country: 'india', state: 'maharashtra',     city: 'pune' },
  { country: 'india', state: 'maharashtra',     city: 'nagpur' },
  { country: 'india', state: 'karnataka',       city: 'bangalore' },
  { country: 'india', state: 'karnataka',       city: 'mysore' },
  { country: 'india', state: 'tamil-nadu',      city: 'chennai' },
  { country: 'india', state: 'tamil-nadu',      city: 'coimbatore' },
  { country: 'india', state: 'telangana',       city: 'hyderabad' },
  { country: 'india', state: 'delhi',           city: 'new-delhi' },
  { country: 'india', state: 'uttar-pradesh',   city: 'lucknow' },
  { country: 'india', state: 'uttar-pradesh',   city: 'noida' },
  { country: 'india', state: 'west-bengal',     city: 'kolkata' },
  { country: 'india', state: 'rajasthan',       city: 'jaipur' },
  { country: 'india', state: 'kerala',          city: 'kochi' },
  // USA
  { country: 'united-states', state: 'california',  city: 'los-angeles' },
  { country: 'united-states', state: 'california',  city: 'san-francisco' },
  { country: 'united-states', state: 'texas',       city: 'houston' },
  { country: 'united-states', state: 'texas',       city: 'dallas' },
  { country: 'united-states', state: 'new-york',    city: 'new-york-city' },
  { country: 'united-states', state: 'florida',     city: 'miami' },
  { country: 'united-states', state: 'illinois',    city: 'chicago' },
  // UK
  { country: 'united-kingdom', state: 'england',    city: 'london' },
  { country: 'united-kingdom', state: 'england',    city: 'manchester' },
  { country: 'united-kingdom', state: 'england',    city: 'birmingham' },
  // Australia
  { country: 'australia', state: 'new-south-wales', city: 'sydney' },
  { country: 'australia', state: 'victoria',        city: 'melbourne' },
  { country: 'australia', state: 'queensland',      city: 'brisbane' },
  // Canada
  { country: 'canada', state: 'ontario',            city: 'toronto' },
  { country: 'canada', state: 'british-columbia',   city: 'vancouver' },
  // UAE
  { country: 'uae', state: 'dubai',                 city: 'dubai' },
];

// India city-level data for sitemap — all states + union territories
const INDIA_CITY_ROUTES = [
  { stateName: 'Andhra Pradesh',  cities: ['Visakhapatnam','Vijayawada','Guntur','Tirupati','Nellore','Kurnool','Kakinada','Rajahmundry','Kadapa','Anantapur','Eluru','Ongole','Chittoor','Srikakulam','Vizianagaram','Proddatur','Hindupur','Tenali','Machilipatnam','Bhimavaram','Adoni','Nandyal','Narasaraopet','Tadipatri','Dharmavaram','Amaravati'] },
  { stateName: 'Arunachal Pradesh', cities: ['Itanagar','Naharlagun','Pasighat','Tawang','Ziro','Bomdila','Tezu','Along','Aalo','Khonsa','Roing','Changlang','Namsai'] },
  { stateName: 'Assam',           cities: ['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','Diphu','Goalpara','Karimganj','North Lakhimpur','Sivasagar','Golaghat','Barpeta','Nalbari','Hailakandi','Haflong','Kokrajhar','Lumding','Mangaldoi','Hojai','Biswanath Chariali'] },
  { stateName: 'Bihar',           cities: ['Patna','Gaya','Bhagalpur','Muzaffarpur','Darbhanga','Purnia','Arrah','Bihar Sharif','Begusarai','Katihar','Munger','Chhapra','Bettiah','Motihari','Samastipur','Hajipur','Sitamarhi','Madhubani','Supaul','Kishanganj','Araria','Nawada','Jamui','Nalanda','Aurangabad','Gopalganj','Siwan','Vaishali','Madhepura','Saharsa','Khagaria','Buxar'] },
  { stateName: 'Chhattisgarh',    cities: ['Raipur','Bhilai','Bilaspur','Durg','Korba','Rajnandgaon','Raigarh','Jagdalpur','Ambikapur','Dhamtari','Mahasamund','Kanker','Kawardha','Bemetara','Janjgir','Baloda Bazar','Kondagaon','Bastar'] },
  { stateName: 'Goa',             cities: ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim','Curchorem','Sanquelim','Mormugao','Calangute'] },
  { stateName: 'Gujarat',         cities: ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Bhavnagar','Jamnagar','Junagadh','Anand','Mehsana','Nadiad','Morbi','Surendranagar','Bharuch','Navsari','Valsad','Botad','Porbandar','Amreli','Patan','Dahod','Palanpur','Godhra','Veraval','Gandhidham','Dwarka','Ankleshwar','Kalol','Mundra','Deesa','Gondal','Wankaner','Modasa','Visnagar','Unjha','Sidhpur','Sanand','Dholka','Dhoraji','Jetpur','Upleta','Mahuva','Palitana','Halol'] },
  { stateName: 'Haryana',         cities: ['Gurgaon','Faridabad','Panipat','Hisar','Rohtak','Ambala','Karnal','Sonipat','Yamunanagar','Rewari','Bhiwani','Jhajjar','Sirsa','Jind','Kaithal','Kurukshetra','Palwal','Fatehabad','Panchkula','Narnaul','Bahadurgarh','Hansi','Tohana','Charkhi Dadri','Ballabhgarh','Manesar','Dharuhera'] },
  { stateName: 'Himachal Pradesh', cities: ['Shimla','Manali','Dharamsala','Solan','Mandi','Kullu','Hamirpur','Una','Chamba','Bilaspur','Kangra','Nahan','Sundarnagar','Palampur','Baddi','Nurpur','Dalhousie','Kasauli','Parwanoo','Rampur'] },
  { stateName: 'Jharkhand',       cities: ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh','Giridih','Ramgarh','Medininagar','Gumla','Lohardaga','Simdega','Jamtara','Dumka','Pakur','Godda','Sahibganj','Latehar','Garhwa','Koderma','Khunti','Chaibasa','Phusro','Sindri','Chas'] },
  { stateName: 'Karnataka',       cities: ['Bangalore','Mysore','Hubli','Mangalore','Belagavi','Kalaburagi','Davangere','Bellary','Shimoga','Tumkur','Raichur','Bidar','Vijayapura','Hassan','Udupi','Mandya','Chikkamagaluru','Chitradurga','Dharwad','Gadag','Haveri','Koppal','Bagalkot','Yadgir','Chamarajanagar','Kolar','Chikkaballapura','Ramanagara','Anekal','Hospet','Gangavati','Ranebennur','Bhadravati','Tiptur','Channapatna','Gundlupet','Puttur','Manipal','Sirsi','Karwar'] },
  { stateName: 'Kerala',          cities: ['Kochi','Thiruvananthapuram','Kozhikode','Thrissur','Kollam','Kannur','Alappuzha','Palakkad','Malappuram','Kottayam','Idukki','Pathanamthitta','Wayanad','Kasaragod','Munnar','Guruvayur','Kayamkulam','Changanacherry','Tirur','Manjeri','Perinthalmanna','Ottappalam','Shoranur','Chalakudy','Irinjalakuda','Muvattupuzha','Perumbavoor','Aluva','Thalassery','Vatakara','Kanhangad','Payyanur','Punalur','Adoor','Thiruvalla','Haripad','Mavelikkara'] },
  { stateName: 'Madhya Pradesh',  cities: ['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Satna','Rewa','Ratlam','Dewas','Chhindwara','Singrauli','Burhanpur','Khandwa','Bhind','Morena','Guna','Shivpuri','Datia','Mandsaur','Neemuch','Hoshangabad','Sehore','Vidisha','Raisen','Betul','Balaghat','Mandla','Anuppur','Umaria','Shahdol','Sidhi','Katni','Damoh','Panna','Chhatarpur','Tikamgarh','Ashoknagar','Rajgarh','Shajapur','Alirajpur','Barwani','Dhar','Jhabua','Khargone'] },
  { stateName: 'Maharashtra',     cities: ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Navi Mumbai','Solapur','Kolhapur','Amravati','Sangli','Satara','Jalgaon','Akola','Latur','Dhule','Ahmednagar','Chandrapur','Parbhani','Nanded','Osmanabad','Buldhana','Washim','Yavatmal','Wardha','Bhandara','Gondia','Gadchiroli','Ratnagiri','Sindhudurg','Raigad','Alibaug','Panvel','Mira-Bhayandar','Vasai-Virar','Kalyan','Dombivali','Ulhasnagar','Bhiwandi','Badlapur','Malegaon','Jalna','Hingoli','Nandurbar','Palghar','Ichalkaranji','Miraj','Barshi','Pandharpur','Baramati','Shirdi','Kopargaon'] },
  { stateName: 'Manipur',         cities: ['Imphal','Thoubal','Bishnupur','Churachandpur','Ukhrul','Senapati','Tamenglong','Chandel','Jiribam','Kakching','Kangpokpi'] },
  { stateName: 'Meghalaya',       cities: ['Shillong','Tura','Nongstoin','Williamnagar','Jowai','Baghmara','Resubelpara','Ampati','Nongpoh','Khliehriat','Cherrapunji'] },
  { stateName: 'Mizoram',         cities: ['Aizawl','Lunglei','Serchhip','Kolasib','Champhai','Saiha','Mamit','Lawngtlai'] },
  { stateName: 'Nagaland',        cities: ['Kohima','Dimapur','Mokokchung','Wokha','Tuensang','Mon','Zunheboto','Phek','Longleng','Kiphire','Peren'] },
  { stateName: 'Odisha',          cities: ['Bhubaneswar','Cuttack','Rourkela','Brahmapur','Sambalpur','Puri','Balasore','Bhadrak','Baripada','Jharsuguda','Bargarh','Dhenkanal','Keonjhar','Phulbani','Rayagada','Koraput','Nabarangpur','Bolangir','Kendrapara','Paradip','Talcher','Angul','Jajpur','Jagatsinghpur','Khordha','Nayagarh','Berhampur','Sundargarh','Malkangiri','Nuapada','Sonepur','Kalahandi'] },
  { stateName: 'Punjab',          cities: ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Hoshiarpur','Gurdaspur','Firozpur','Moga','Fatehgarh Sahib','Ropar','Sangrur','Barnala','Mansa','Faridkot','Muktsar','Fazilka','Pathankot','Kapurthala','Nawanshahr','Tarn Taran','Malerkotla','Khanna','Phagwara','Abohar','Rajpura','Zirakpur','Morinda','Samana'] },
  { stateName: 'Rajasthan',       cities: ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Alwar','Bhilwara','Bharatpur','Sikar','Jhunjhunu','Sri Ganganagar','Pali','Barmer','Jaisalmer','Chittorgarh','Tonk','Bundi','Sawai Madhopur','Nagaur','Jhalawar','Karauli','Dholpur','Dausa','Rajsamand','Dungarpur','Banswara','Pratapgarh','Sirohi','Hanumangarh','Churu','Jalor','Baran','Beawar','Kishangarh','Makrana','Sujangarh','Fatehpur','Balotra','Hindaun','Gangapur City'] },
  { stateName: 'Sikkim',          cities: ['Gangtok','Namchi','Mangan','Gyalshing','Ravangla','Jorethang','Nayabazar','Singtam','Rangpo'] },
  { stateName: 'Tamil Nadu',      cities: ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tiruppur','Erode','Vellore','Thoothukudi','Tirunelveli','Thanjavur','Dindigul','Kanchipuram','Cuddalore','Nagapattinam','Namakkal','Ariyalur','Perambalur','Pudukkottai','Ramanathapuram','Sivaganga','Theni','Virudhunagar','Krishnagiri','Dharmapuri','Tiruvannamalai','Villupuram','Tiruvarur','Karur','Kallakurichi','Ranipet','Chengalpattu','Tenkasi','Tirupattur','Mayiladuthurai','Hosur','Ooty','Kodaikanal','Kumbakonam','Karaikudi','Pollachi','Sivakasi','Ambattur','Avadi','Tambaram'] },
  { stateName: 'Telangana',       cities: ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Mahbubnagar','Nalgonda','Adilabad','Suryapet','Miryalaguda','Siddipet','Mancherial','Jagtial','Kothagudem','Bhongir','Vikarabad','Sangareddy','Medak','Wanaparthy','Gadwal','Nagarkurnool','Narayanpet','Bhadradri','Mahabubabad','Jangaon','Hanamkonda','Secunderabad','Cyberabad'] },
  { stateName: 'Tripura',         cities: ['Agartala','Udaipur','Dharmanagar','Kailasahar','Belonia','Ambassa','Bishalgarh','Kamalpur','Sabroom','Sonamura','Khowai','Teliamura'] },
  { stateName: 'Uttar Pradesh',   cities: ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Meerut','Noida','Ghaziabad','Bareilly','Aligarh','Moradabad','Saharanpur','Gorakhpur','Firozabad','Jhansi','Muzaffarnagar','Mathura','Shahjahanpur','Rampur','Sitapur','Bulandshahar','Hapur','Sambhal','Amroha','Etawah','Mainpuri','Hardoi','Unnao','Rae Bareli','Sultanpur','Ayodhya','Ambedkar Nagar','Bahraich','Barabanki','Gonda','Balrampur','Basti','Deoria','Kushinagar','Maharajganj','Siddharthnagar','Azamgarh','Mau','Ballia','Jaunpur','Ghazipur','Chandauli','Mirzapur','Sonbhadra','Hamirpur','Chitrakoot','Banda','Mahoba','Lalitpur','Jalaun','Orai','Etah','Kasganj','Hathras','Farrukhabad','Kannauj','Auraiya','Fatehpur','Pratapgarh','Lakhimpur Kheri','Pilibhit','Budaun','Bijnor','Shamli','Baghpat','Greater Noida'] },
  { stateName: 'Uttarakhand',     cities: ['Dehradun','Haridwar','Roorkee','Haldwani','Rudrapur','Kashipur','Rishikesh','Kotdwar','Ramnagar','Almora','Nainital','Pithoragarh','Champawat','Bageshwar','Chamoli','Tehri','Uttarkashi','Pauri','Mussoorie','Ranikhet'] },
  { stateName: 'West Bengal',     cities: ['Kolkata','Howrah','Durgapur','Asansol','Siliguri','Bardhaman','Malda','Murshidabad','Birbhum','Bankura','Purulia','Medinipur','Krishnanagar','Barasat','Jalpaiguri','Darjeeling','Alipurduar','Cooch Behar','Raiganj','Islampur','Balurghat','Suri','Rampurhat','Bolpur','Santiniketan','Berhampore','Jangipur','Kandi','Tamluk','Contai','Haldia','Baruipur','Diamond Harbour','Bishnupur','Kharagpur','Arambag','Chandernagore','Serampore','Barrackpore','Titagarh','Naihati','Habra'] },
  // Union Territories
  { stateName: 'Delhi',           cities: ['New Delhi','Dwarka','Rohini','Pitampura','Janakpuri','Laxmi Nagar','Shahdara','Saket','Vasant Kunj','Hauz Khas','Karol Bagh','Lajpat Nagar','Malviya Nagar','Nehru Place','Okhla','Narela','Najafgarh','Mehrauli'] },
  { stateName: 'Jammu and Kashmir', cities: ['Srinagar','Jammu','Anantnag','Baramulla','Sopore','Kathua','Udhampur','Rajouri','Poonch','Doda','Pulwama','Shopian','Kulgam','Kupwara','Bandipora','Ganderbal','Budgam','Reasi','Ramban','Kishtwar','Samba','Akhnoor'] },
  { stateName: 'Puducherry',      cities: ['Puducherry','Karaikal','Mahe','Yanam'] },
  { stateName: 'Chandigarh',      cities: ['Chandigarh'] },
  { stateName: 'Andaman and Nicobar Islands', cities: ['Port Blair','Mayabunder','Rangat','Diglipur'] },
  { stateName: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Daman','Diu','Silvassa'] },
  { stateName: 'Ladakh',          cities: ['Leh','Kargil'] },
  { stateName: 'Lakshadweep',     cities: ['Kavaratti','Agatti','Minicoy'] },
];

// USA city-level data for sitemap — all 50 states + DC
const USA_CITY_ROUTES = [
  { stateName: 'Alabama',        cities: ['Birmingham','Montgomery','Huntsville','Mobile','Tuscaloosa','Hoover','Dothan','Auburn','Decatur','Madison','Florence','Gadsden','Prattville','Phenix City','Alabaster','Bessemer','Enterprise','Daphne','Opelika','Northport'] },
  { stateName: 'Alaska',         cities: ['Anchorage','Fairbanks','Juneau','Sitka','Ketchikan','Wasilla','Kenai','Kodiak','Palmer','Homer','Soldotna'] },
  { stateName: 'Arizona',        cities: ['Phoenix','Tucson','Mesa','Chandler','Scottsdale','Glendale','Gilbert','Tempe','Peoria','Surprise','Yuma','Avondale','Goodyear','Flagstaff','Lake Havasu City','Buckeye','Casa Grande','Sierra Vista','Maricopa','Oro Valley','Prescott','Bullhead City','Prescott Valley','Apache Junction','Marana'] },
  { stateName: 'Arkansas',       cities: ['Little Rock','Fort Smith','Fayetteville','Springdale','Jonesboro','North Little Rock','Conway','Rogers','Pine Bluff','Bentonville','Benton','Hot Springs','Texarkana','Sherwood','Jacksonville','Russellville','Bella Vista','West Memphis','Paragould','Cabot'] },
  { stateName: 'California',     cities: ['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland','Bakersfield','Anaheim','Santa Ana','Riverside','Stockton','Chula Vista','Irvine','Fremont','San Bernardino','Modesto','Fontana','Moreno Valley','Glendale','Huntington Beach','Santa Clarita','Garden Grove','Oxnard','Oceanside','Rancho Cucamonga','Santa Rosa','Ontario','Elk Grove','Corona','Hayward','Pomona','Escondido','Torrance','Sunnyvale','Pasadena','Fullerton','Salinas','Concord','Visalia','Thousand Oaks','Simi Valley','Santa Clara','Roseville','Vallejo','Victorville','El Monte','Berkeley','Downey','Costa Mesa','Inglewood','Ventura','West Covina','Norwalk','Burbank','Antioch','Richmond','Temecula','Murrieta','Daly City','Santa Barbara','San Mateo','El Cajon','Carlsbad','Fairfield','Palm Desert','Palm Springs','Redding','Chico'] },
  { stateName: 'Colorado',       cities: ['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Thornton','Arvada','Westminster','Pueblo','Centennial','Boulder','Highlands Ranch','Greeley','Longmont','Loveland','Broomfield','Castle Rock','Commerce City','Parker','Northglenn','Brighton','Littleton','Grand Junction','Englewood','Durango'] },
  { stateName: 'Connecticut',    cities: ['Bridgeport','New Haven','Hartford','Stamford','Waterbury','Norwalk','Danbury','New Britain','West Hartford','Greenwich','Hamden','Bristol','Meriden','Manchester','West Haven','Milford','Stratford','East Hartford','Middletown','Shelton','Torrington','New London','Groton'] },
  { stateName: 'Delaware',       cities: ['Wilmington','Dover','Newark','Middletown','Smyrna','Milford','Seaford','Georgetown','Elsmere','New Castle','Bear','Brookside'] },
  { stateName: 'Florida',        cities: ['Jacksonville','Miami','Tampa','Orlando','St. Petersburg','Hialeah','Port St. Lucie','Cape Coral','Tallahassee','Fort Lauderdale','Pembroke Pines','Hollywood','Gainesville','Miramar','Coral Springs','Clearwater','Palm Bay','Lakeland','West Palm Beach','Pompano Beach','Davie','Miami Gardens','Boca Raton','Fort Myers','Deltona','Melbourne','Sunrise','Plantation','North Miami','Deerfield Beach','Boynton Beach','Kissimmee','Lauderhill','Homestead','Weston','Daytona Beach','Delray Beach','Wellington','Largo','Palm Beach Gardens','Margate','Coconut Creek','Ocala','Sanford','Miami Beach','Pensacola','Sarasota','Bradenton','Bonita Springs','Doral','Naples','Fort Pierce'] },
  { stateName: 'Georgia',        cities: ['Atlanta','Columbus','Augusta','Macon','Savannah','Athens','Sandy Springs','Roswell','Johns Creek','Albany','Warner Robins','Alpharetta','Marietta','Smyrna','Valdosta','Brookhaven','Dunwoody','Gainesville','Peachtree City','Rome','East Point','Stonecrest','Newnan','Kennesaw','Canton','Woodstock','Dalton','Lawrenceville','Douglasville','Statesboro','Griffin','Brunswick'] },
  { stateName: 'Hawaii',         cities: ['Honolulu','Pearl City','Hilo','Kailua','Waipahu','Kaneohe','Mililani Town','Kahului','Ewa Beach','Kihei','Makakilo','Wahiawa','Kapaa','Wailuku','Kailua-Kona'] },
  { stateName: 'Idaho',          cities: ['Boise','Meridian','Nampa','Idaho Falls','Pocatello','Caldwell',"Coeur d'Alene",'Twin Falls','Lewiston','Post Falls','Rexburg','Moscow','Eagle','Garden City','Kuna','Ammon','Chubbuck','Hayden'] },
  { stateName: 'Illinois',       cities: ['Chicago','Aurora','Joliet','Rockford','Springfield','Elgin','Peoria','Champaign','Waukegan','Cicero','Naperville','Bloomington','Evanston','Decatur','Schaumburg','Bolingbrook','Palatine','Skokie','Des Plaines','Orland Park','Tinley Park','Oak Lawn','Berwyn','Mount Prospect','Normal','Wheaton','Hoffman Estates','Oak Park','Downers Grove','Arlington Heights','Gurnee','Carbondale','Moline','Rock Island','Galesburg','Quincy','Crystal Lake','Lombard','Carol Stream'] },
  { stateName: 'Indiana',        cities: ['Indianapolis','Fort Wayne','Evansville','South Bend','Carmel','Fishers','Bloomington','Hammond','Gary','Muncie','Lafayette','Terre Haute','Kokomo','Anderson','Greenwood','Elkhart','Mishawaka','Lawrence','Jeffersonville','Columbus','Noblesville','Westfield','New Albany','Portage','Merrillville'] },
  { stateName: 'Iowa',           cities: ['Des Moines','Cedar Rapids','Davenport','Sioux City','Iowa City','Waterloo','Council Bluffs','Dubuque','Ames','West Des Moines','Urbandale','Cedar Falls','Marion','Ankeny','Bettendorf','Mason City','Clinton','Burlington','Ottumwa','Fort Dodge'] },
  { stateName: 'Kansas',         cities: ['Wichita','Overland Park','Kansas City','Olathe','Topeka','Lawrence','Shawnee','Manhattan','Lenexa','Salina','Hutchinson','Leavenworth','Leawood','Dodge City','Garden City','Emporia','Derby','Liberal','Hays','Pittsburg'] },
  { stateName: 'Kentucky',       cities: ['Louisville','Lexington','Bowling Green','Owensboro','Covington','Hopkinsville','Richmond','Florence','Georgetown','Henderson','Elizabethtown','Nicholasville','Jeffersontown','Paducah','Frankfort','Radcliff','Ashland','Independence','Madisonville','Murray'] },
  { stateName: 'Louisiana',      cities: ['New Orleans','Baton Rouge','Shreveport','Metairie','Lafayette','Lake Charles','Kenner','Bossier City','Monroe','Alexandria','Houma','New Iberia','Laplace','Slidell','Hammond','Prairieville','Central','Marrero','Harvey'] },
  { stateName: 'Maine',          cities: ['Portland','Lewiston','Bangor','South Portland','Auburn','Biddeford','Sanford','Augusta','Saco','Westbrook','Waterville','Presque Isle','Bath','Old Town','Ellsworth'] },
  { stateName: 'Maryland',       cities: ['Baltimore','Columbia','Germantown','Silver Spring','Waldorf','Glen Burnie','Ellicott City','Frederick','Dundalk','Rockville','Gaithersburg','Bethesda','Towson','Bowie','Aspen Hill','Wheaton','Annapolis','Hagerstown','College Park','Greenbelt','Essex','Potomac','North Bethesda','Catonsville','Pikesville','Bel Air','Severn','Odenton','Laurel','Oxon Hill'] },
  { stateName: 'Massachusetts',  cities: ['Boston','Worcester','Springfield','Lowell','Cambridge','New Bedford','Brockton','Quincy','Lynn','Fall River','Newton','Somerville','Lawrence','Waltham','Haverhill','Malden','Medford','Taunton','Chicopee','Revere','Peabody','Methuen','Barnstable','Pittsfield','Attleboro','Salem','Holyoke','Westfield','Leominster','Fitchburg','Framingham','Weymouth','Lexington','Burlington','Woburn'] },
  { stateName: 'Michigan',       cities: ['Detroit','Grand Rapids','Warren','Sterling Heights','Ann Arbor','Lansing','Flint','Dearborn','Livonia','Westland','Troy','Farmington Hills','Kalamazoo','Wyoming','Southfield','Rochester Hills','Taylor','Pontiac','St. Clair Shores','Royal Oak','Saginaw','Kentwood','East Lansing','Roseville','Dearborn Heights','Midland','Bay City','Jackson','Holland','Muskegon','Battle Creek','Portage','Waterford','Auburn Hills','Mount Pleasant'] },
  { stateName: 'Minnesota',      cities: ['Minneapolis','St. Paul','Rochester','Duluth','Bloomington','Brooklyn Park','Plymouth','St. Cloud','Eagan','Woodbury','Maple Grove','Coon Rapids','Burnsville','Apple Valley','Edina','Minnetonka','St. Louis Park','Moorhead','Mankato','Blaine','Shakopee','Maplewood','Richfield','Brooklyn Center','Lakeville','Eden Prairie','Chaska','Cottage Grove','Roseville'] },
  { stateName: 'Mississippi',    cities: ['Jackson','Gulfport','Southaven','Hattiesburg','Biloxi','Meridian','Tupelo','Greenville','Olive Branch','Horn Lake','Pearl','Madison','Clinton','Brandon','Starkville','Columbus','Pascagoula','Vicksburg','Ridgeland','Byram'] },
  { stateName: 'Missouri',       cities: ['Kansas City','St. Louis','Springfield','Columbia','Independence',"Lee's Summit","O'Fallon",'St. Joseph','St. Charles','Blue Springs','Joplin','Chesterfield','Jefferson City','Cape Girardeau','Florissant','Wentzville','Ballwin','Wildwood','Raytown','Liberty','University City','Hazelwood','Kirkwood','Maryland Heights'] },
  { stateName: 'Montana',        cities: ['Billings','Missoula','Great Falls','Bozeman','Butte','Helena','Kalispell','Havre','Anaconda','Miles City','Livingston','Whitefish','Lewistown','Sidney','Glendive'] },
  { stateName: 'Nebraska',       cities: ['Omaha','Lincoln','Bellevue','Grand Island','Kearney','Fremont','Hastings','Norfolk','Columbus','Papillion','La Vista','Scottsbluff','South Sioux City','North Platte','Gering'] },
  { stateName: 'Nevada',         cities: ['Las Vegas','Henderson','Reno','North Las Vegas','Sparks','Carson City','Sunrise Manor','Paradise','Enterprise','Spring Valley','Whitney','Summerlin South','Fernley','Elko','Boulder City','Mesquite','Pahrump'] },
  { stateName: 'New Hampshire',  cities: ['Manchester','Nashua','Concord','Derry','Dover','Rochester','Salem','Merrimack','Hudson','Londonderry','Keene','Bedford','Portsmouth','Goffstown','Laconia'] },
  { stateName: 'New Jersey',     cities: ['Newark','Jersey City','Paterson','Elizabeth','Edison','Woodbridge','Lakewood','Toms River','Hamilton','Trenton','Clifton','Camden','Brick','Cherry Hill','Passaic','Middletown','Union City','Old Bridge','East Orange','Bayonne','Franklin','North Bergen','Vineland','Union','Piscataway','New Brunswick','Hoboken','Perth Amboy','Parsippany-Troy Hills','Howell','Gloucester Township','Wayne','Irvington','Atlantic City'] },
  { stateName: 'New Mexico',     cities: ['Albuquerque','Las Cruces','Rio Rancho','Santa Fe','Roswell','Farmington','Alamogordo','Clovis','Hobbs','Carlsbad','Gallup','Artesia','Lovington','Sunland Park','Deming','Taos','Los Lunas','Espanola'] },
  { stateName: 'New York',       cities: ['New York City','Buffalo','Rochester','Yonkers','Syracuse','Albany','New Rochelle','Mount Vernon','Schenectady','Utica','White Plains','Hempstead','Troy','Niagara Falls','Binghamton','Long Beach','Rome','Freeport','Valley Stream','Brooklyn','Queens','Manhattan','The Bronx','Staten Island','Ithaca','Poughkeepsie','Huntington','Brentwood','Amherst','Cheektowaga','Tonawanda','Elmira','Newburgh','Middletown','Watertown','Oswego','Saratoga Springs'] },
  { stateName: 'North Carolina', cities: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville','Cary','Wilmington','High Point','Concord','Gastonia','Asheville','Chapel Hill','Huntersville','Rocky Mount','Burlington','Wilson','Kannapolis','Apex','Greenville','Jacksonville','Mooresville','Hickory','Monroe','Indian Trail','Wake Forest','Sanford','New Bern','Matthews','Goldsboro','Statesville','Salisbury','Kernersville','Lumberton'] },
  { stateName: 'North Dakota',   cities: ['Fargo','Bismarck','Grand Forks','Minot','West Fargo','Williston','Dickinson','Mandan','Jamestown','Wahpeton','Devils Lake','Watford City'] },
  { stateName: 'Ohio',           cities: ['Columbus','Cleveland','Cincinnati','Toledo','Akron','Dayton','Parma','Canton','Youngstown','Lorain','Hamilton','Springfield','Kettering','Elyria','Lakewood','Cuyahoga Falls','Euclid','Middletown','Newark','Cleveland Heights','Mansfield','Mentor','Dublin','Beavercreek','Strongsville','Fairfield','Findlay','Warren','Lancaster','Lima','Huber Heights','Westerville','Medina','Zanesville','Reynoldsburg'] },
  { stateName: 'Oklahoma',       cities: ['Oklahoma City','Tulsa','Norman','Broken Arrow','Edmond','Lawton','Moore','Midwest City','Stillwater','Enid','Muskogee','Bartlesville','Owasso','Shawnee','Ponca City','Ardmore','Claremore','Bethany','Sapulpa','Altus'] },
  { stateName: 'Oregon',         cities: ['Portland','Eugene','Salem','Gresham','Hillsboro','Beaverton','Bend','Medford','Springfield','Corvallis','Albany','Tigard','Lake Oswego','Aloha','Keizer','Grants Pass','Oregon City','McMinnville','Redmond','Tualatin','Ashland','Roseburg','Klamath Falls','Coos Bay'] },
  { stateName: 'Pennsylvania',   cities: ['Philadelphia','Pittsburgh','Allentown','Erie','Reading','Scranton','Bethlehem','Lancaster','Harrisburg','Altoona','York','Wilkes-Barre','Chester','Norristown','State College','Easton','Hazleton','Lebanon','New Castle','Johnstown','Pottstown','Bensalem','Abington','Upper Darby','Levittown','McKeesport','Bethel Park','Monroeville','Plum','Doylestown'] },
  { stateName: 'Rhode Island',   cities: ['Providence','Cranston','Warwick','Pawtucket','East Providence','Woonsocket','Coventry','Cumberland','North Providence','West Warwick','Johnston','North Kingstown','South Kingstown','Smithfield','Central Falls'] },
  { stateName: 'South Carolina', cities: ['Columbia','Charleston','North Charleston','Mount Pleasant','Rock Hill','Greenville','Summerville','Sumter','Goose Creek','Hilton Head Island','Myrtle Beach','Florence','Anderson','Mauldin','Greenwood','Conway','Spartanburg','Gaffney','Bluffton','Simpsonville','Aiken','Greer','Easley','Lexington','Hanahan'] },
  { stateName: 'South Dakota',   cities: ['Sioux Falls','Rapid City','Aberdeen','Brookings','Watertown','Mitchell','Yankton','Pierre','Huron','Vermillion','Spearfish','Brandon','Box Elder'] },
  { stateName: 'Tennessee',      cities: ['Memphis','Nashville','Knoxville','Chattanooga','Clarksville','Murfreesboro','Franklin','Jackson','Johnson City','Bartlett','Hendersonville','Kingsport','Collierville','Smyrna','Cleveland','Brentwood','Germantown','Columbia','Spring Hill','La Vergne','Cookeville','Lebanon','Morristown','Gallatin','Oak Ridge'] },
  { stateName: 'Texas',          cities: ['Houston','San Antonio','Dallas','Austin','Fort Worth','El Paso','Arlington','Corpus Christi','Plano','Laredo','Lubbock','Garland','Irving','Amarillo','Grand Prairie','Brownsville','McKinney','Frisco','Pasadena','Killeen','McAllen','Mesquite','Denton','Carrollton','Midland','Waco','Abilene','Beaumont','Odessa','Round Rock','Richardson','The Woodlands','Pearland','Lewisville','Sugar Land','College Station','Tyler','League City','Allen','Wichita Falls','San Angelo','Edinburg','Mission','Longview','Bryan','Baytown','Pharr','Temple','Missouri City','Flower Mound','Georgetown','Harlingen','North Richland Hills','Coppell','Mansfield','Rowlett','Conroe','Cedar Park','Rockwall','Euless','Grapevine','Pflugerville','Katy','New Braunfels','Atascocita'] },
  { stateName: 'Utah',           cities: ['Salt Lake City','West Valley City','Provo','West Jordan','Orem','Sandy','Ogden','St. George','Layton','South Jordan','Lehi','Millcreek','Taylorsville','Logan','Murray','Draper','Bountiful','Riverton','Roy','Spanish Fork','Herriman','Cottonwood Heights','American Fork','Clearfield','Syracuse'] },
  { stateName: 'Vermont',        cities: ['Burlington','South Burlington','Rutland','Barre','Montpelier','Winooski','St. Albans','Newport','Vergennes','Middlebury','Brattleboro','Bennington','Stowe'] },
  { stateName: 'Virginia',       cities: ['Virginia Beach','Norfolk','Chesapeake','Richmond','Newport News','Alexandria','Hampton','Roanoke','Portsmouth','Suffolk','Lynchburg','Harrisonburg','Charlottesville','Danville','Manassas','Fredericksburg','Arlington','Falls Church','McLean','Herndon','Leesburg','Ashburn','Sterling','Dale City','Reston','Centreville','Blacksburg','Winchester','Staunton','Waynesboro'] },
  { stateName: 'Washington',     cities: ['Seattle','Spokane','Tacoma','Vancouver','Bellevue','Kent','Everett','Renton','Spokane Valley','Kirkland','Bellingham','Kennewick','Yakima','Federal Way','Redmond','Marysville','South Hill','Shoreline','Richland','Sammamish','Auburn','Pasco','Lakewood','Burien','Olympia','Puyallup','Bremerton','Mount Vernon','Walla Walla'] },
  { stateName: 'West Virginia',  cities: ['Charleston','Huntington','Morgantown','Parkersburg','Wheeling','Weirton','Fairmont','Beckley','Martinsburg','Clarksburg','South Charleston','St. Albans','Vienna','Bluefield','Cross Lanes'] },
  { stateName: 'Wisconsin',      cities: ['Milwaukee','Madison','Green Bay','Kenosha','Racine','Appleton','Waukesha','Oshkosh','Eau Claire','Janesville','West Allis','La Crosse','Sheboygan','Wauwatosa','Fond du Lac','Brookfield','New Berlin','Wausau','Menomonee Falls','Greenfield','Beloit','Franklin','Oak Creek','Manitowoc','West Bend'] },
  { stateName: 'Wyoming',        cities: ['Cheyenne','Casper','Laramie','Gillette','Rock Springs','Sheridan','Green River','Evanston','Riverton','Cody','Jackson','Lander','Torrington'] },
  { stateName: 'District of Columbia', cities: ['Washington DC'] },
];

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getCategorySlugs() {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase.from('categories').select('slug').order('slug');
    return (data || []).map((r) => r.slug).filter(Boolean);
  } catch { return []; }
}

async function getDbBlogSlugs() {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

// ─── Sitemap (split into multiple files for Vercel/Google limits) ────────────
const URLS_PER_SITEMAP = 45000;

export async function generateSitemaps() {
  const categorySlugs = await getCategorySlugs();
  const total = estimateUrlCount(categorySlugs.length);
  const count = Math.ceil(total / URLS_PER_SITEMAP);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

function estimateUrlCount(catCount) {
  const top500 = Math.min(catCount, 500);
  const top300 = Math.min(catCount, 300);
  const top150 = Math.min(catCount, 150);
  const top100 = Math.min(catCount, 100);
  const indiaCities = INDIA_CITY_ROUTES.reduce((s, r) => s + r.cities.length, 0);
  const usaCities = USA_CITY_ROUTES.reduce((s, r) => s + r.cities.length, 0);
  return 10 + BLOG_SLUGS.length + catCount + (top500 * TARGET_COUNTRIES.length)
    + (top300 * KEY_STATES.length) + (top150 * KEY_CITIES.length)
    + (top100 * indiaCities) + (top100 * usaCities)
    + (top300 * 230) + (top300 * 228)  // CA + NY
    + (top300 * 161) + (top300 * 138) + (top300 * 124)  // TX + FL + IL
    + (top300 * 125) + (top300 * 153) + (top300 * 101)  // PA + MA + WA
    + (top300 * 106) + (top300 * 165); // GA + NJ
}

export default async function sitemap({ id }) {
  const now = new Date();

  const [categorySlugs, dbPosts] = await Promise.all([
    getCategorySlugs(),
    getDbBlogSlugs(),
  ]);

  const start = id * URLS_PER_SITEMAP;
  const end = start + URLS_PER_SITEMAP;

  function* gen() {
  const staticSlugsSet = new Set(BLOG_SLUGS);

  // ── Static pages ────────────────────────────────────────────────────────────
  yield { url: `${BASE_URL}/`,                   lastModified: now, changeFrequency: 'daily',   priority: 1.0 };
  yield { url: `${BASE_URL}/directory`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 };
  yield { url: `${BASE_URL}/directory/staffing`, lastModified: now, changeFrequency: 'weekly',  priority: 0.8 };
  yield { url: `${BASE_URL}/blogs`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.8 };
  yield { url: `${BASE_URL}/contact`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 };
  yield { url: `${BASE_URL}/ListYourCompany`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 };
  yield { url: `${BASE_URL}/Categories`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 };

  // ── Staffing sub-pages ──────────────────────────────────────────────────────
  for (const slug of STAFFING_SLUGS)
    yield { url: `${BASE_URL}/directory/staffing/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 };

  // ── Blog pages ──────────────────────────────────────────────────────────────
  for (const slug of BLOG_SLUGS)
    yield { url: `${BASE_URL}/blogs/${slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 };
  for (const p of dbPosts)
    if (!staticSlugsSet.has(p.slug))
      yield { url: `${BASE_URL}/blogs/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: 'monthly', priority: 0.7 };

  // ── Category directory pages (all categories) ───────────────────────────────
  for (const slug of categorySlugs)
    yield { url: `${BASE_URL}/directory/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 };

  // ── Country pages (top 500 × all countries) ───────────────────────────────
  for (const slug of categorySlugs.slice(0, 500))
    for (const countrySlug of TARGET_COUNTRIES) {
      const countryName = COUNTRY_NAMES[countrySlug];
      if (countryName)
        yield { url: `${BASE_URL}/directory/${slug}?country=${encodeURIComponent(countryName)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 };
    }

  // ── State pages (top 300 × key states) ────────────────────────────────────
  for (const slug of categorySlugs.slice(0, 300))
    for (const { country, state } of KEY_STATES) {
      const countryName = COUNTRY_NAMES[country];
      const stateName = STATE_NAMES[state];
      if (countryName && stateName)
        yield { url: `${BASE_URL}/directory/${slug}?country=${encodeURIComponent(countryName)}&amp;state=${encodeURIComponent(stateName)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.78 };
    }

  // ── City pages (top 150 × key cities) ─────────────────────────────────────
  for (const slug of categorySlugs.slice(0, 150))
    for (const { country, state } of KEY_CITIES) {
      const countryName = COUNTRY_NAMES[country];
      const stateName = STATE_NAMES[state];
      if (countryName && stateName)
        yield { url: `${BASE_URL}/directory/${slug}?country=${encodeURIComponent(countryName)}&amp;state=${encodeURIComponent(stateName)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 };
    }

  // ── India city pages (top 100 × all India cities) ─────────────────────────
  for (const slug of categorySlugs.slice(0, 100))
    for (const { stateName, cities } of INDIA_CITY_ROUTES)
      for (const city of cities)
        yield { url: `${BASE_URL}/directory/${slug}?country=India&amp;state=${encodeURIComponent(stateName)}&amp;city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.72 };

  // ── USA city pages (top 100 × all USA cities) ─────────────────────────────
  for (const slug of categorySlugs.slice(0, 100))
    for (const { stateName, cities } of USA_CITY_ROUTES)
      for (const city of cities)
        yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&amp;state=${encodeURIComponent(stateName)}&amp;city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.72 };

  // ── California deep coverage: ALL categories × all California cities/areas ──
  const CALIFORNIA_CITIES = [
    // Silicon Valley & Bay Area
    'San Jose','San Francisco','Sunnyvale','Santa Clara','Mountain View','Palo Alto',
    'Menlo Park','Cupertino','Milpitas','Fremont','Redwood City','San Mateo',
    'Foster City','Burlingame','South San Francisco','Daly City','San Bruno',
    'Campbell','Los Gatos','Saratoga','Los Altos','Newark','Union City',
    'Hayward','Pleasanton','Livermore','Dublin','San Ramon','Walnut Creek',
    'Concord','Berkeley','Oakland','Emeryville','Alameda','Richmond',
    'San Leandro','Castro Valley','Half Moon Bay','Pacifica','Belmont',
    'San Carlos','Woodside','Atherton','Portola Valley','Stanford',
    // Los Angeles Metro
    'Los Angeles','Santa Monica','Beverly Hills','Culver City','Pasadena',
    'Burbank','Glendale','Long Beach','Torrance','El Segundo','Marina del Rey',
    'Venice','West Hollywood','Hollywood','Downtown LA','Playa Vista',
    'Manhattan Beach','Hermosa Beach','Redondo Beach','Malibu',
    'Westwood','Century City','Encino','Sherman Oaks','Studio City',
    'Woodland Hills','Calabasas','Agoura Hills','Thousand Oaks','Simi Valley',
    'Northridge','Van Nuys','North Hollywood','Arcadia','Monrovia',
    'West Covina','Pomona','Claremont','Azusa','Glendora','Covina',
    'Alhambra','San Gabriel','Monterey Park','Rosemead','Temple City',
    'Whittier','La Mirada','Cerritos','Downey','Norwalk','Lakewood',
    'Compton','Carson','Gardena','Hawthorne','Inglewood','Lawndale',
    // Orange County
    'Irvine','Anaheim','Santa Ana','Costa Mesa','Newport Beach','Huntington Beach',
    'Fullerton','Orange','Tustin','Lake Forest','Mission Viejo','Laguna Beach',
    'Laguna Niguel','San Clemente','Dana Point','Aliso Viejo','Laguna Hills',
    'Rancho Santa Margarita','Yorba Linda','Brea','Placentia','Buena Park',
    'Cypress','La Habra','Garden Grove','Westminster','Fountain Valley','Stanton',
    // San Diego
    'San Diego','La Jolla','Del Mar','Carlsbad','Encinitas','Oceanside',
    'Vista','San Marcos','Escondido','Poway','Rancho Bernardo','Chula Vista',
    'National City','El Cajon','La Mesa','Santee','Coronado',
    // Inland Empire
    'Riverside','San Bernardino','Ontario','Rancho Cucamonga','Corona',
    'Moreno Valley','Fontana','Temecula','Murrieta','Palm Springs',
    'Palm Desert','Redlands','Upland','Chino','Chino Hills','Claremont',
    // Sacramento & Central Valley
    'Sacramento','Roseville','Folsom','Elk Grove','Davis','Woodland',
    'Rocklin','Lincoln','Rancho Cordova','Citrus Heights','Natomas',
    'West Sacramento','Stockton','Modesto','Fresno','Visalia','Bakersfield',
    'Clovis','Merced','Turlock','Manteca','Tracy','Lodi',
    // North Bay
    'Santa Rosa','Napa','Petaluma','San Rafael','Novato','Vallejo',
    'Fairfield','Vacaville','Sebastopol','Healdsburg','Sonoma','Mill Valley',
    'Sausalito','Tiburon','Larkspur','Corte Madera','San Anselmo',
    // Central Coast
    'Santa Barbara','San Luis Obispo','Monterey','Santa Cruz','Salinas',
    'Paso Robles','Pismo Beach','Ventura','Oxnard','Camarillo','Goleta',
    'Carpinteria','Watsonville','Aptos','Capitola','Scotts Valley',
    // Tech & Innovation Hubs
    'Pleasanton','Walnut Creek','San Ramon','Danville','Lafayette',
    'Orinda','Moraga','Brentwood','Antioch','Pittsburg',
  ];
  for (const slug of categorySlugs.slice(0, 300))
    for (const city of CALIFORNIA_CITIES)
      yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&state=California&city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.73 };

  // ── New York deep coverage: ALL categories × all New York cities/areas ──
  const NEW_YORK_CITIES = [
    // New York City — Boroughs & Neighborhoods
    'New York City','Manhattan','Brooklyn','Queens','The Bronx','Staten Island',
    'Midtown Manhattan','Lower Manhattan','Upper East Side','Upper West Side','Harlem',
    'SoHo','Tribeca','Chelsea','Greenwich Village','East Village','West Village',
    'Financial District','Flatiron District','Gramercy','Murray Hill','Hell\'s Kitchen',
    'Times Square','NoHo','Nolita','Chinatown Manhattan','Little Italy',
    'Williamsburg','DUMBO','Park Slope','Bushwick','Greenpoint','Brooklyn Heights',
    'Crown Heights','Bed-Stuy','Flatbush','Bay Ridge','Sunset Park','Red Hook',
    'Astoria','Long Island City','Flushing','Jackson Heights','Forest Hills',
    'Bayside','Jamaica','Rego Park','Sunnyside','Woodside','Elmhurst',
    'Riverdale','Fordham','Pelham Bay','Throgs Neck','Mott Haven','South Bronx',
    // Long Island
    'Hempstead','Garden City','Great Neck','Manhasset','Roslyn','Port Washington',
    'Mineola','Westbury','Hicksville','Levittown','Massapequa','Farmingdale',
    'Syosset','Jericho','Plainview','Oyster Bay','Huntington','Cold Spring Harbor',
    'Babylon','Islip','Smithtown','Brookhaven','Riverhead','Southampton',
    'East Hampton','Montauk','Stony Brook','Port Jefferson','Patchogue','Bay Shore',
    'Commack','Hauppauge','Melville','Dix Hills','Woodbury NY',
    // Westchester County
    'White Plains','Yonkers','New Rochelle','Scarsdale','Rye','Mamaroneck',
    'Larchmont','Bronxville','Tuckahoe','Eastchester','Pelham','Harrison',
    'Tarrytown','Sleepy Hollow','Dobbs Ferry','Hastings on Hudson','Irvington NY',
    'Ossining','Croton on Hudson','Peekskill','Mount Kisco','Bedford','Katonah',
    'Chappaqua','Armonk','Purchase','Port Chester','Greenwich NY',
    // Hudson Valley
    'Poughkeepsie','Newburgh','Middletown','Kingston','New Paltz','Beacon',
    'Fishkill','Wappingers Falls','Hyde Park','Rhinebeck','Red Hook NY',
    'Monroe','Warwick','Goshen','Chester','Cornwall','Highland Falls',
    'Suffern','Nyack','Spring Valley','Pearl River','Nanuet','Haverstraw',
    // Capital District
    'Albany','Troy','Schenectady','Saratoga Springs','Clifton Park','Colonie',
    'Guilderland','Latham','Niskayuna','Delmar','Loudonville','Cohoes',
    'Rensselaer','East Greenbush','Malta','Ballston Spa','Glens Falls','Queensbury',
    // Central New York
    'Syracuse','Utica','Rome','Oneida','Cortland','Ithaca','Auburn','Oswego',
    'Canandaigua','Geneva','Seneca Falls','Watertown','Ogdensburg','Plattsburgh',
    'Potsdam','Canton','Massena','Malone',
    // Western New York
    'Buffalo','Rochester','Niagara Falls','Batavia','Jamestown','Lockport',
    'North Tonawanda','Tonawanda','Amherst','Cheektowaga','Clarence','Orchard Park',
    'Hamburg','East Aurora','Williamsville','Kenmore','Depew','Lancaster',
    'West Seneca','Pittsford','Brighton','Penfield','Fairport','Webster',
    'Greece','Irondequoit','Henrietta','Victor','Canandaigua',
    // Southern Tier
    'Binghamton','Elmira','Owego','Corning','Horseheads','Johnson City',
    'Endicott','Vestal','Olean','Wellsville','Bath','Watkins Glen',
    // Tech & Business Hubs
    'Armonk','Purchase','White Plains','Tarrytown','Poughkeepsie',
    'Ithaca','Rochester','Albany','Syracuse',
  ];
  for (const slug of categorySlugs.slice(0, 300))
    for (const city of NEW_YORK_CITIES)
      yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&state=New%20York&city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.73 };

  // ── Texas deep coverage ──
  const TEXAS_CITIES = [
    // Dallas-Fort Worth Metro
    'Dallas','Fort Worth','Arlington','Plano','Irving','Garland','Grand Prairie','McKinney','Frisco',
    'Mesquite','Carrollton','Denton','Lewisville','Allen','Flower Mound','Mansfield','North Richland Hills',
    'Rowlett','Euless','Grapevine','Coppell','Cedar Hill','DeSoto','Duncanville','Lancaster','Wylie',
    'Rockwall','Sachse','Murphy','Richardson','Southlake','Keller','Colleyville','Bedford','Hurst',
    'Burleson','Cleburne','Ennis','Waxahachie','Weatherford','Granbury','Corsicana','Greenville','Terrell',
    'Prosper','Celina','Little Elm','The Colony','Highland Village','Corinth','Lake Dallas','Argyle',
    // Houston Metro
    'Houston','Pasadena','Pearland','Sugar Land','League City','Baytown','Missouri City','Conroe',
    'The Woodlands','Spring','Humble','Katy','Cypress','Kingwood','Atascocita','Friendswood',
    'Deer Park','La Porte','Galveston','Texas City','Dickinson','Santa Fe','Webster','Clear Lake',
    'Stafford','Richmond','Rosenberg','Alvin','Angleton','Lake Jackson','Tomball','Magnolia',
    'Galena Park','Channelview','Seabrook','Kemah','Nassau Bay','Bellaire','West University Place',
    // Austin Metro
    'Austin','Round Rock','Cedar Park','Georgetown','Pflugerville','San Marcos','Kyle','Buda',
    'Leander','Hutto','Taylor','Lakeway','Bee Cave','Dripping Springs','Manor','Bastrop',
    'Elgin','Lockhart','Wimberley','Lago Vista','Spicewood','Marble Falls','Burnet',
    // San Antonio Metro
    'San Antonio','New Braunfels','Schertz','Cibolo','Universal City','Live Oak','Converse',
    'Seguin','Boerne','Helotes','Leon Valley','Alamo Heights','Selma','Garden Ridge',
    // Other Major Cities
    'El Paso','Lubbock','Corpus Christi','Laredo','Amarillo','Brownsville','McAllen','Killeen',
    'Midland','Odessa','Waco','Abilene','Beaumont','Tyler','Temple','College Station','Bryan',
    'Wichita Falls','San Angelo','Edinburg','Mission','Pharr','Longview','Texarkana','Harlingen',
    'Lufkin','Nacogdoches','Victoria','Sherman','Denison','Paris','Del Rio','Eagle Pass',
  ];

  // ── Florida deep coverage ──
  const FLORIDA_CITIES = [
    // Miami Metro
    'Miami','Miami Beach','Fort Lauderdale','Hollywood','Hialeah','Coral Gables','Doral','Kendall',
    'Homestead','Miami Gardens','North Miami','North Miami Beach','Aventura','Sunny Isles Beach',
    'Key Biscayne','Coconut Grove','Brickell','Wynwood','Little Havana','Overtown','Design District',
    'Pembroke Pines','Miramar','Davie','Plantation','Weston','Sunrise','Coral Springs','Parkland',
    'Pompano Beach','Deerfield Beach','Boca Raton','Delray Beach','Boynton Beach',
    'West Palm Beach','Palm Beach','Palm Beach Gardens','Jupiter','Wellington','Royal Palm Beach',
    'Lake Worth','Riviera Beach','Stuart','Port St. Lucie','Fort Pierce','Vero Beach',
    // Orlando Metro
    'Orlando','Kissimmee','Sanford','Winter Park','Altamonte Springs','Casselberry','Longwood',
    'Oviedo','Winter Garden','Clermont','Apopka','Lake Mary','Celebration','Windermere',
    'Daytona Beach','Deltona','DeLand','New Smyrna Beach','Port Orange','Ormond Beach',
    'Melbourne','Palm Bay','Titusville','Cocoa','Cocoa Beach','Merritt Island','Rockledge',
    // Tampa Bay
    'Tampa','St. Petersburg','Clearwater','Brandon','Lakeland','Plant City','Temple Terrace',
    'Largo','Dunedin','Safety Harbor','Oldsmar','Tarpon Springs','New Port Richey','Wesley Chapel',
    'Land O Lakes','Lutz','Riverview','Valrico','Lithia','Ruskin','Sun City Center',
    'Bradenton','Sarasota','Venice','North Port','Palmetto','Englewood','Osprey',
    // Southwest Florida
    'Fort Myers','Cape Coral','Naples','Bonita Springs','Estero','Lehigh Acres','Marco Island',
    'Sanibel','Fort Myers Beach','Punta Gorda','Port Charlotte',
    // North Florida
    'Jacksonville','Jacksonville Beach','Atlantic Beach','Neptune Beach','St. Augustine',
    'Ponte Vedra Beach','Orange Park','Fleming Island','Fernandina Beach','Amelia Island',
    'Tallahassee','Gainesville','Ocala','Panama City','Pensacola','Destin','Fort Walton Beach',
    'Niceville','Crestview','Navarre','Milton','Pace',
    // Florida Keys
    'Key West','Key Largo','Islamorada','Marathon',
  ];

  // ── Illinois deep coverage ──
  const ILLINOIS_CITIES = [
    // Chicago Metro
    'Chicago','Aurora','Naperville','Joliet','Elgin','Waukegan','Cicero','Schaumburg',
    'Bolingbrook','Palatine','Skokie','Des Plaines','Orland Park','Tinley Park','Oak Lawn',
    'Berwyn','Mount Prospect','Evanston','Hoffman Estates','Oak Park','Downers Grove',
    'Arlington Heights','Lombard','Carol Stream','Streamwood','Hanover Park','Glendale Heights',
    'Bartlett','Addison','Elk Grove Village','Wheaton','Glen Ellyn','Lisle','Woodridge',
    'Darien','Hinsdale','Clarendon Hills','Western Springs','La Grange','Riverside',
    'Oak Brook','Elmhurst','Villa Park','Bensenville','Wood Dale','Itasca','Roselle',
    'Bloomingdale','Glenview','Northbrook','Wilmette','Winnetka','Kenilworth','Glencoe',
    'Highland Park','Lake Forest','Libertyville','Vernon Hills','Mundelein','Gurnee',
    'Buffalo Grove','Wheeling','Prospect Heights','Rolling Meadows','Barrington','Crystal Lake',
    'McHenry','Algonquin','Huntley','Cary','Lake in the Hills','Woodstock',
    'St. Charles','Geneva','Batavia','North Aurora','Oswego','Yorkville','Plainfield',
    'Romeoville','Lockport','New Lenox','Frankfort','Mokena','Homer Glen','Lemont',
    'Orland Hills','Palos Heights','Palos Hills','Worth','Chicago Ridge','Oak Forest',
    'Country Club Hills','Matteson','Olympia Fields','Flossmoor','Homewood','Park Forest',
    'Calumet City','Lansing','South Holland','Harvey','Dolton','Midlothian',
    // Downstate
    'Springfield','Peoria','Rockford','Champaign','Urbana','Bloomington','Normal',
    'Decatur','Carbondale','Edwardsville','Collinsville','Belleville','O Fallon IL',
    'Quincy','Galesburg','Moline','Rock Island','DeKalb','Kankakee','Danville',
  ];

  // ── Pennsylvania deep coverage ──
  const PENNSYLVANIA_CITIES = [
    // Philadelphia Metro
    'Philadelphia','Chester','Norristown','King of Prussia','Conshohocken','Plymouth Meeting',
    'Blue Bell','Lansdale','North Wales','Doylestown','Newtown','Yardley','Morrisville',
    'Media','Springfield PA','Drexel Hill','Havertown','Broomall','Bryn Mawr','Ardmore',
    'Wayne','Devon','Paoli','Malvern','Exton','West Chester','Downingtown','Coatesville',
    'Phoenixville','Collegeville','Pottstown','Norristown','Abington','Jenkintown','Elkins Park',
    'Cheltenham','Willow Grove','Horsham','Warminster','Warrington','Chalfont','Quakertown',
    'Levittown','Bensalem','Bristol','Langhorne','Fairless Hills','Penndel',
    'Bala Cynwyd','Narberth','Merion','Gladwyne','Villanova','Radnor',
    // Pittsburgh Metro
    'Pittsburgh','McKeesport','Bethel Park','Mount Lebanon','Upper St. Clair','Peters Township',
    'Cranberry Township','Wexford','Sewickley','Moon Township','Robinson Township','Coraopolis',
    'Monroeville','Murrysville','Irwin','Greensburg','Latrobe','Jeannette',
    'Washington PA','Canonsburg','McMurray','Cecil Township','North Fayette',
    'Butler','Mars','Zelienople','Slippery Rock','Grove City',
    // Other Major Cities
    'Allentown','Bethlehem','Easton','Emmaus','Macungie','Whitehall',
    'Reading','Wyomissing','Shillington','Kutztown',
    'Lancaster','Lititz','Manheim','Ephrata','Elizabethtown',
    'Harrisburg','Hershey','Mechanicsburg','Camp Hill','Carlisle','Chambersburg',
    'York','Hanover','Red Lion','Dallastown',
    'Erie','Meadville','Edinboro',
    'Scranton','Wilkes-Barre','Hazleton','Stroudsburg','East Stroudsburg',
    'State College','Bellefonte','Lewisburg','Williamsport','Lock Haven',
    'Altoona','Johnstown','Indiana PA','Clarion','Oil City',
  ];

  // ── Massachusetts deep coverage ──
  const MASSACHUSETTS_CITIES = [
    // Greater Boston
    'Boston','Cambridge','Somerville','Brookline','Newton','Watertown','Waltham',
    'Needham','Wellesley','Natick','Framingham','Marlborough','Sudbury','Wayland',
    'Lexington','Arlington','Winchester','Woburn','Burlington','Bedford','Billerica',
    'Medford','Malden','Revere','Chelsea','Everett','Lynn','Saugus','Peabody','Salem',
    'Danvers','Beverly','Marblehead','Swampscott','Nahant',
    'Quincy','Braintree','Weymouth','Hingham','Cohasset','Scituate','Marshfield',
    'Milton','Canton','Dedham','Norwood','Westwood','Dover','Sherborn',
    'Stoughton','Randolph','Avon','Brockton','Bridgewater','Easton','Sharon',
    'Foxborough','Franklin MA','Wrentham','Norfolk','Millis','Medway','Bellingham',
    // North Shore & Merrimack Valley
    'Lowell','Lawrence','Haverhill','Methuen','Andover','North Andover','Tewksbury',
    'Chelmsford','Dracut','Westford','Groton','Pepperell','Ayer','Littleton',
    'Concord MA','Acton','Maynard','Stow','Hudson','Marlborough','Northborough',
    'Gloucester','Rockport','Ipswich','Newburyport','Newbury','Salisbury','Amesbury',
    // South Shore & Cape Cod
    'Plymouth','Duxbury','Kingston','Carver','Wareham','Bourne',
    'Falmouth','Mashpee','Sandwich','Barnstable','Hyannis','Yarmouth','Dennis',
    'Brewster','Chatham','Harwich','Orleans','Eastham','Wellfleet','Truro','Provincetown',
    'Nantucket','Martha\'s Vineyard','Oak Bluffs','Edgartown','Vineyard Haven',
    'Taunton','Fall River','New Bedford','Dartmouth','Fairhaven','Mattapoisett',
    // Central & Western Massachusetts
    'Worcester','Shrewsbury','Westborough','Southborough','Grafton','Millbury','Auburn MA',
    'Leominster','Fitchburg','Gardner','Athol','Templeton',
    'Springfield','Holyoke','Chicopee','Westfield','Agawam','West Springfield',
    'Northampton','Amherst','Hadley','South Hadley','Easthampton',
    'Pittsfield','Williamstown','North Adams','Great Barrington','Lee','Lenox','Stockbridge',
  ];

  // ── Washington State deep coverage ──
  const WASHINGTON_CITIES = [
    // Seattle Metro
    'Seattle','Bellevue','Redmond','Kirkland','Bothell','Kenmore','Woodinville',
    'Issaquah','Sammamish','Mercer Island','Renton','Kent','Tukwila','SeaTac',
    'Federal Way','Auburn WA','Covington','Maple Valley','Enumclaw','Black Diamond',
    'Shoreline','Lake Forest Park','Mountlake Terrace','Lynnwood','Edmonds','Mukilteo',
    'Everett','Marysville','Lake Stevens','Snohomish','Monroe','Sultan','Granite Falls',
    'Burien','Des Moines WA','Normandy Park','Vashon','Bainbridge Island',
    'Tacoma','Lakewood WA','University Place','Puyallup','Bonney Lake','Sumner','Orting',
    'Gig Harbor','Port Orchard','Bremerton','Silverdale','Poulsbo','Kingston WA',
    'Olympia','Lacey','Tumwater','Centralia','Chehalis','Shelton',
    // Eastern Washington
    'Spokane','Spokane Valley','Liberty Lake','Cheney','Medical Lake','Airway Heights',
    'Pullman','Moscow ID border','Coeur d Alene border',
    // Central Washington
    'Yakima','Ellensburg','Wenatchee','East Wenatchee','Leavenworth','Chelan',
    'Kennewick','Richland','Pasco','West Richland','Prosser','Sunnyside',
    // Other
    'Vancouver WA','Camas','Washougal','Battle Ground','Ridgefield','Woodland WA',
    'Bellingham','Lynden','Ferndale','Blaine','Anacortes','Burlington WA','Mount Vernon WA',
    'Walla Walla','College Place','Moses Lake','Ephrata WA','Quincy WA',
    'Longview','Kelso','Centralia','Aberdeen','Hoquiam',
  ];

  // ── Georgia deep coverage ──
  const GEORGIA_CITIES = [
    // Atlanta Metro
    'Atlanta','Sandy Springs','Roswell','Johns Creek','Alpharetta','Milton','Cumming',
    'Duluth','Suwanee','Lawrenceville','Lilburn','Norcross','Peachtree Corners',
    'Marietta','Smyrna','Kennesaw','Acworth','Woodstock','Canton GA','Holly Springs',
    'Dunwoody','Brookhaven','Chamblee','Doraville','Clarkston','Tucker','Stone Mountain',
    'Decatur','Avondale Estates','Pine Lake','Lithonia','Conyers','Covington','Monroe GA',
    'East Point','College Park','Union City GA','Fairburn','Palmetto','Fayetteville',
    'Peachtree City','Newnan','Senoia','Tyrone','Brooks',
    'Snellville','Loganville','Grayson','Dacula','Buford','Flowery Branch',
    'Gainesville GA','Dahlonega','Cleveland GA','Helen','Toccoa',
    'Carrollton','Villa Rica','Douglasville','Austell','Mableton','Powder Springs',
    'McDonough','Stockbridge','Hampton','Locust Grove','Jackson GA','Griffin',
    'Cartersville','Rome GA','Dalton','Calhoun','Adairsville',
    // Other Major Cities
    'Savannah','Tybee Island','Pooler','Richmond Hill','Hinesville','Statesboro',
    'Augusta','Evans','Martinez','North Augusta border',
    'Macon','Warner Robins','Perry','Fort Valley','Byron',
    'Columbus GA','Phenix City border','Opelika border',
    'Athens','Watkinsville','Winterville','Bogart',
    'Albany GA','Valdosta','Tifton','Moultrie','Thomasville','Bainbridge',
    'Brunswick','St. Simons Island','Jekyll Island','Waycross','Jesup',
  ];

  // ── New Jersey deep coverage ──
  const NEW_JERSEY_CITIES = [
    // North Jersey
    'Newark','Jersey City','Paterson','Elizabeth','Hoboken','Bayonne','Union City NJ',
    'North Bergen','West New York','Guttenberg','Secaucus','Kearny','Harrison NJ',
    'East Orange','Orange NJ','Montclair','Bloomfield','Glen Ridge','Nutley','Belleville',
    'Clifton','Passaic','Garfield','Lodi NJ','Hackensack','Teaneck','Englewood','Fort Lee',
    'Ridgewood','Paramus','Fair Lawn','Glen Rock','Wyckoff','Mahwah','Ramsey',
    'Wayne NJ','Totowa','Little Falls','Woodland Park','West Caldwell','Caldwell',
    'Livingston','West Orange','South Orange','Maplewood','Millburn','Short Hills',
    'Summit','New Providence','Berkeley Heights','Chatham','Madison NJ','Florham Park',
    'Morristown','Parsippany','Morris Plains','Denville','Rockaway','Dover NJ','Randolph',
    // Central Jersey
    'New Brunswick','Edison','Woodbridge','Piscataway','South Brunswick','North Brunswick',
    'East Brunswick','Old Bridge','Sayreville','Perth Amboy','South Amboy','Metuchen',
    'Highland Park','Somerset','Franklin Township','Hillsborough','Bridgewater NJ','Raritan',
    'Somerville','Bound Brook','Manville','Flemington','Clinton NJ',
    'Princeton','Plainsboro','West Windsor','East Windsor','Hightstown','Cranbury',
    'Trenton','Hamilton NJ','Ewing','Lawrence Township','Pennington','Hopewell',
    'Red Bank','Shrewsbury','Rumson','Fair Haven','Little Silver','Long Branch',
    'Asbury Park','Ocean Township','Deal','Monmouth Beach','Sea Bright',
    'Middletown NJ','Holmdel','Hazlet','Keyport','Matawan','Aberdeen',
    'Freehold','Manalapan','Marlboro','Colts Neck','Howell NJ',
    // South Jersey
    'Cherry Hill','Voorhees','Haddonfield','Collingswood','Merchantville','Pennsauken',
    'Camden','Gloucester City','Woodbury','Swedesboro','Mullica Hill',
    'Mount Laurel','Moorestown','Medford','Evesham','Marlton',
    'Vineland','Millville','Bridgeton','Salem NJ',
    'Atlantic City','Margate','Ventnor','Longport','Brigantine','Somers Point',
    'Egg Harbor Township','Galloway','Hammonton','Mays Landing',
    'Toms River','Brick','Lakewood NJ','Jackson NJ','Manchester','Beachwood',
    'Point Pleasant','Manasquan','Spring Lake','Belmar','Bradley Beach','Avon by the Sea',
    'Cape May','Wildwood','Ocean City NJ','Sea Isle City','Avalon','Stone Harbor',
  ];

  // ── Deep state coverage ────────────────────────────────────────────────────
  for (const [stateName, cities] of [
    ['Texas', TEXAS_CITIES], ['Florida', FLORIDA_CITIES], ['Illinois', ILLINOIS_CITIES],
    ['Pennsylvania', PENNSYLVANIA_CITIES], ['Massachusetts', MASSACHUSETTS_CITIES],
    ['Washington', WASHINGTON_CITIES], ['Georgia', GEORGIA_CITIES], ['New Jersey', NEW_JERSEY_CITIES],
  ])
    for (const slug of categorySlugs.slice(0, 300))
      for (const city of cities)
        yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&state=${encodeURIComponent(stateName)}&city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.73 };
  } // end gen()

  const routes = [];
  let i = 0;
  for (const route of gen()) {
    if (i >= end) break;
    if (i >= start) routes.push(route);
    i++;
  }
  return routes;
}
