const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');


const STAFFING_SLUGS = [
  'it-technology-staffing', 'healthcare-staffing', 'industrial-manufacturing-staffing',
  'construction-staffing', 'accounting-finance-staffing', 'administrative-office-staffing',
  'executive-search-recruiting', 'legal-staffing', 'engineering-staffing',
  'warehouse-logistics-staffing', 'temporary-staffing', 'remote-staffing',
  'government-defense-staffing', 'hospitality-event-staffing', 'scientific-pharmaceutical-staffing',
];

const TARGET_STATES = [
  'california', 'texas', 'new-york', 'florida', 'illinois',
  'pennsylvania', 'ohio', 'georgia', 'virginia', 'north-carolina',
  'michigan', 'maryland', 'massachusetts', 'washington', 'colorado',
  'tennessee', 'arizona', 'minnesota', 'wisconsin', 'missouri',
  'indiana', 'oregon', 'connecticut', 'new-jersey', 'south-carolina',
];

// US-focused: State slug → display name
const STATE_NAMES = {
  'california': 'California', 'texas': 'Texas', 'new-york': 'New York',
  'florida': 'Florida', 'illinois': 'Illinois', 'pennsylvania': 'Pennsylvania',
  'ohio': 'Ohio', 'georgia': 'Georgia', 'virginia': 'Virginia',
  'north-carolina': 'North Carolina', 'michigan': 'Michigan', 'maryland': 'Maryland',
  'massachusetts': 'Massachusetts', 'washington': 'Washington', 'colorado': 'Colorado',
  'tennessee': 'Tennessee', 'arizona': 'Arizona', 'minnesota': 'Minnesota',
  'wisconsin': 'Wisconsin', 'missouri': 'Missouri', 'indiana': 'Indiana',
  'oregon': 'Oregon', 'connecticut': 'Connecticut', 'new-jersey': 'New Jersey',
  'south-carolina': 'South Carolina',
};

// Key US states for state-level pages
const KEY_STATES = [
  { country: 'united-states', state: 'california' },
  { country: 'united-states', state: 'texas' },
  { country: 'united-states', state: 'new-york' },
  { country: 'united-states', state: 'florida' },
  { country: 'united-states', state: 'illinois' },
  { country: 'united-states', state: 'pennsylvania' },
  { country: 'united-states', state: 'ohio' },
  { country: 'united-states', state: 'georgia' },
  { country: 'united-states', state: 'virginia' },
  { country: 'united-states', state: 'north-carolina' },
  { country: 'united-states', state: 'michigan' },
  { country: 'united-states', state: 'maryland' },
  { country: 'united-states', state: 'massachusetts' },
  { country: 'united-states', state: 'washington' },
  { country: 'united-states', state: 'colorado' },
  { country: 'united-states', state: 'tennessee' },
  { country: 'united-states', state: 'arizona' },
  { country: 'united-states', state: 'minnesota' },
  { country: 'united-states', state: 'new-jersey' },
  { country: 'united-states', state: 'indiana' },
  { country: 'united-states', state: 'missouri' },
  { country: 'united-states', state: 'wisconsin' },
  { country: 'united-states', state: 'oregon' },
  { country: 'united-states', state: 'connecticut' },
  { country: 'united-states', state: 'south-carolina' },
];

// Key US cities for city-level pages
const KEY_CITIES = [
  { country: 'united-states', state: 'california',      city: 'los-angeles' },
  { country: 'united-states', state: 'california',      city: 'san-francisco' },
  { country: 'united-states', state: 'california',      city: 'san-diego' },
  { country: 'united-states', state: 'california',      city: 'san-jose' },
  { country: 'united-states', state: 'texas',           city: 'houston' },
  { country: 'united-states', state: 'texas',           city: 'dallas' },
  { country: 'united-states', state: 'texas',           city: 'austin' },
  { country: 'united-states', state: 'texas',           city: 'san-antonio' },
  { country: 'united-states', state: 'new-york',        city: 'new-york-city' },
  { country: 'united-states', state: 'florida',         city: 'miami' },
  { country: 'united-states', state: 'florida',         city: 'tampa' },
  { country: 'united-states', state: 'florida',         city: 'orlando' },
  { country: 'united-states', state: 'florida',         city: 'jacksonville' },
  { country: 'united-states', state: 'illinois',        city: 'chicago' },
  { country: 'united-states', state: 'pennsylvania',    city: 'philadelphia' },
  { country: 'united-states', state: 'pennsylvania',    city: 'pittsburgh' },
  { country: 'united-states', state: 'ohio',            city: 'columbus' },
  { country: 'united-states', state: 'ohio',            city: 'cleveland' },
  { country: 'united-states', state: 'ohio',            city: 'cincinnati' },
  { country: 'united-states', state: 'georgia',         city: 'atlanta' },
  { country: 'united-states', state: 'virginia',        city: 'richmond' },
  { country: 'united-states', state: 'north-carolina',  city: 'charlotte' },
  { country: 'united-states', state: 'north-carolina',  city: 'raleigh' },
  { country: 'united-states', state: 'michigan',        city: 'detroit' },
  { country: 'united-states', state: 'maryland',        city: 'baltimore' },
  { country: 'united-states', state: 'massachusetts',   city: 'boston' },
  { country: 'united-states', state: 'washington',      city: 'seattle' },
  { country: 'united-states', state: 'colorado',        city: 'denver' },
  { country: 'united-states', state: 'tennessee',       city: 'nashville' },
  { country: 'united-states', state: 'arizona',         city: 'phoenix' },
  { country: 'united-states', state: 'minnesota',       city: 'minneapolis' },
  { country: 'united-states', state: 'missouri',        city: 'kansas-city' },
  { country: 'united-states', state: 'missouri',        city: 'st-louis' },
  { country: 'united-states', state: 'indiana',         city: 'indianapolis' },
  { country: 'united-states', state: 'oregon',          city: 'portland' },
  { country: 'united-states', state: 'new-jersey',      city: 'newark' },
  { country: 'united-states', state: 'wisconsin',       city: 'milwaukee' },
  { country: 'united-states', state: 'connecticut',     city: 'hartford' },
  { country: 'united-states', state: 'south-carolina',  city: 'charleston' },
];

// India city routes removed — US-only focus now
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
  const usaCities = USA_CITY_ROUTES.reduce((s, r) => s + r.cities.length, 0);
  return 10 + catCount + (top500 * TARGET_STATES.length)
    + (top300 * KEY_STATES.length) + (top150 * KEY_CITIES.length)
    + (top100 * usaCities)
    + (top300 * 230) + (top300 * 228)  // CA + NY
    + (top300 * 161) + (top300 * 138) + (top300 * 124)  // TX + FL + IL
    + (top300 * 125) + (top300 * 153) + (top300 * 101)  // PA + MA + WA
    + (top300 * 106) + (top300 * 165); // GA + NJ
}

export default async function sitemap({ id }) {
  const now = new Date();

  const categorySlugs = await getCategorySlugs();

  const start = id * URLS_PER_SITEMAP;
  const end = start + URLS_PER_SITEMAP;

  function* gen() {

  // ── Static pages ────────────────────────────────────────────────────────────
  yield { url: `${BASE_URL}/`,                   lastModified: now, changeFrequency: 'daily',   priority: 1.0 };
  yield { url: `${BASE_URL}/directory`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 };
  yield { url: `${BASE_URL}/directory/staffing`, lastModified: now, changeFrequency: 'weekly',  priority: 0.8 };
  yield { url: `${BASE_URL}/contact`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 };
  yield { url: `${BASE_URL}/ListYourCompany`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 };
  yield { url: `${BASE_URL}/ai-match`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 };
  yield { url: `${BASE_URL}/Compare`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.6 };
  yield { url: `${BASE_URL}/claim-listing`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 };

  // ── Company profile pages ───────────────────────────────────────────────────
  // Intentionally NOT emitted: per product decision, individual /companies/:slug
  // pages are noindex'd. Removing them from the sitemap prevents Google from
  // discovering them as canonical entry points; users still reach them via the
  // directory pages (which ARE indexed).

  // ── Staffing sub-pages ──────────────────────────────────────────────────────
  for (const slug of STAFFING_SLUGS)
    yield { url: `${BASE_URL}/directory/staffing/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 };

  // ── Category directory pages (all categories) ───────────────────────────────
  for (const slug of categorySlugs)
    yield { url: `${BASE_URL}/directory/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 };

  // ── Hand-curated location-specific category pages ───────────────────────────
  // Used to push individual high-value SEO pages into the sitemap so Google
  // discovers the country-filtered variant (e.g. artificial-turf in South Korea).
  const CURATED_LOCATION_PAGES = [
    { slug: 'artificial-turf',           country: 'South Korea' },
    { slug: 'transformers',              country: 'United States' },
    { slug: 'mushroom-producers',        country: 'United States' },
    { slug: 'vinyl-flooring',            country: 'Philippines' },
    { slug: 'construction-companies',    country: 'Mexico' },
    { slug: 'gold',                      country: 'Philippines' },
    { slug: 'loudspeaker-manufacturers', country: 'Denmark' },
    { slug: 'pumps',                     country: 'China' },
    { slug: 'flexible-packaging',        country: 'Canada' },
    { slug: 'glass',                     country: 'United Kingdom' },
    { slug: 'plastic-recycling',         country: 'India' },
    { slug: 'embedded-systems',          country: 'Singapore' },
    { slug: 'toy-manufacturing',         country: 'Singapore' },
    { slug: 'toy-manufacturing',         country: 'India' },
    { slug: 'toy-manufacturing',         country: 'United States' },
    { slug: 'toy-manufacturing',         country: 'Canada' },
    { slug: 'toy-manufacturing',         country: 'Germany' },
    { slug: 'toy-manufacturing',         country: 'France' },
    // Global pages (no country filter)
    { slug: 'underwater-welding' },
    { slug: 'clotted-cream' },
    { slug: 'cryogenic' },
    // More country-targeted pages
    { slug: 'seasoning',             country: 'Greece' },
    { slug: 'accounting-software',   country: 'Kenya' },
    { slug: 'airlines',              country: 'Saudi Arabia' },
    { slug: 'cell-phone-companies',  country: 'United States' },

    // Batch 1 (2026-04-26): 14 directories
    { slug: 'slot-machines',           country: 'United States' },
    { slug: 'beer-distribution',       country: 'United States' },
    { slug: 'cables-wires',            country: 'United States' },
    { slug: 'aftermarket-parts',       country: 'United States' },
    { slug: 'mystery-shopping',        country: 'United States' },
    { slug: 'butter',                  country: 'Spain' },
    { slug: 'networking',              country: 'China' },
    { slug: 'beverage-manufacturers',  country: 'Canada' },
    { slug: 'appraisal-management' },
    { slug: 'roofing',                 country: 'United States' },
    { slug: 'it-consulting',           country: 'Germany' },
    { slug: 'promotions-management',   country: 'India' },
    { slug: 'atm-companies',           country: 'India' },
    { slug: 'alternative-investments', country: 'Australia' },

    // Batch 2 (2026-04-26): 33 directories
    { slug: 'food-processing',           country: 'Mexico' },
    { slug: 'root-beer' },
    { slug: 'hvac',                      country: 'United States' },
    { slug: 'erp-software' },
    { slug: 'dental-implants',           country: 'United States' },
    { slug: 'pex-pipe',                  country: 'United States' },
    { slug: 'professional-services' },
    { slug: 'automotive-manufacturing',  country: 'Kenya' },
    { slug: 'automotive-manufacturing',  country: 'Italy' },
    { slug: 'hockey-tape' },
    { slug: 'solar-lights',              country: 'China' },
    { slug: 'cashews' },
    { slug: 'influencer-marketing',      country: 'Germany' },
    { slug: 'online-event-ticketing',    country: 'Italy' },
    { slug: 'specialty-chemicals',       country: 'Spain' },
    { slug: 'sportswear',                country: 'Italy' },
    { slug: 'composite-siding',          country: 'United States' },
    { slug: 'chemical-manufacturing',    country: 'Malaysia' },
    { slug: 'sensors',                   country: 'Finland' },
    { slug: 'lead-generation',           country: 'United States' },
    { slug: 'vacuum-service-trucks' },
    { slug: 'proton-exchange-membranes' },
    { slug: 'gas-stations',              country: 'United States' },
    { slug: 'ski-manufacturers' },
    { slug: 'end-user-computing' },
    { slug: 'real-estate-development',   country: 'Spain' },
    { slug: 'cigars' },
    { slug: 'pretzels',                  country: 'United States' },
    { slug: 'acting',                    country: 'Turkey' },
    { slug: 'mro' },
    { slug: 'paints',                    country: 'United States' },
  ];
  for (const { slug, country, state, city } of CURATED_LOCATION_PAGES) {
    const qp = new URLSearchParams();
    if (country) qp.set('country', country);
    if (state)   qp.set('state', state);
    if (city)    qp.set('city', city);
    const qs = qp.toString();
    yield { url: qs ? `${BASE_URL}/directory/${slug}?${qs}` : `${BASE_URL}/directory/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 };
  }

  // ── US State pages (all categories × target states) ─────────────────────────
  for (const slug of categorySlugs.slice(0, 500))
    for (const stateSlug of TARGET_STATES) {
      const stateName = STATE_NAMES[stateSlug];
      if (stateName)
        yield { url: `${BASE_URL}/directory/${slug}?location=${encodeURIComponent(stateName)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 };
    }

  // ── US State detail pages (top 300 × key states) ──────────────────────────
  for (const slug of categorySlugs.slice(0, 300))
    for (const { state } of KEY_STATES) {
      const stateName = STATE_NAMES[state];
      if (stateName)
        yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&amp;state=${encodeURIComponent(stateName)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.78 };
    }

  // ── US City pages (top 150 × key cities) ──────────────────────────────────
  for (const slug of categorySlugs.slice(0, 150))
    for (const { state, city } of KEY_CITIES) {
      const stateName = STATE_NAMES[state];
      if (stateName)
        yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&amp;state=${encodeURIComponent(stateName)}&amp;city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 };
    }

  // ── USA city pages (all 50 states × all cities) ───────────────────────────
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
      yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&amp;state=California&amp;city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.73 };

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
      yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&amp;state=New%20York&amp;city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.73 };

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
        yield { url: `${BASE_URL}/directory/${slug}?country=United%20States&amp;state=${encodeURIComponent(stateName)}&amp;city=${encodeURIComponent(city)}`, lastModified: now, changeFrequency: 'weekly', priority: 0.73 };
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
