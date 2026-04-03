"""
FirmsLedger – Ensun.io FULL Category Scraper
=============================================
Scrapes ensun.io for ALL 8,535 category slugs from your site.
Uses 3 parallel browsers for speed. Fully resumable — safe to stop & restart.

Requirements:
    pip install playwright
    playwright install chromium

Usage:
    # Full run (overnight recommended)
    python scripts/scrape_ensun_full.py

    # Parents only (93 categories — fast, ~15 mins)
    python scripts/scrape_ensun_full.py --parents-only

    # Dry-run: check which slugs exist on ensun (no data saved)
    python scripts/scrape_ensun_full.py --dry-run

    # Limit companies per category (default: 10)
    python scripts/scrape_ensun_full.py --limit 10

    # Adjust concurrency (default: 3)
    python scripts/scrape_ensun_full.py --concurrency 2

    # Show browser
    python scripts/scrape_ensun_full.py --show-browser

Output:
    scraped-data/ensun_full/                     ← per-category CSVs
    scraped-data/ensun_full_companies.csv        ← master import file
    scraped-data/ensun_full_progress.csv         ← run log (resume state)
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    from playwright.async_api import async_playwright, Page, BrowserContext
except ImportError:
    print("\n  ERROR: playwright not installed.")
    print("  Run:  pip install playwright && playwright install chromium\n")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────

PROJECT_DIR   = Path(__file__).parent.parent
SLUGS_FILE    = PROJECT_DIR / "scraped-data" / "all_category_slugs.txt"
OUTPUT_DIR    = PROJECT_DIR / "scraped-data" / "ensun_full"
MASTER_CSV    = PROJECT_DIR / "scraped-data" / "ensun_full_companies.csv"
PROGRESS_CSV  = PROJECT_DIR / "scraped-data" / "ensun_full_progress.csv"

BASE_URL = "https://ensun.io/search"

# ── Config ────────────────────────────────────────────────────────────────────

DEFAULT_LIMIT       = 10     # companies per category
DEFAULT_CONCURRENCY = 3      # parallel browser pages
PAGE_DELAY          = 2.5    # seconds after page load
MAX_PAGES           = 5      # max pagination pages per search (safety cap)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# ── Agency import fields ──────────────────────────────────────────────────────

MASTER_FIELDS = [
    "name", "slug", "hq_city", "hq_state", "hq_country",
    "description", "founded_year", "team_size", "logo_url",
    "website", "pricing_model", "min_project_size",
    "services_offered", "industries_served",
    "client_focus_small", "client_focus_medium", "client_focus_large",
    "service_focus",
    "category_slug", "category_name",
]

# ── Profile field generators ──────────────────────────────────────────────────
# Covers all 93 parent categories + subcategories. Each entry is keyword → data.
# Matching: first keyword found in the slug wins (order matters — specific first).

# keyword → [list of services]
SERVICE_MAP = [
    # ── Food & Beverage ──────────────────────────────────────────────────────
    ("bottled-water",   ["Water Production", "Bottling", "Distribution", "Quality Testing"]),
    ("mineral-water",   ["Mineral Water Production", "Bottling", "Distribution", "Quality Testing"]),
    ("sparkling-water", ["Sparkling Water Production", "Carbonation", "Bottling", "Distribution"]),
    ("alkaline-water",  ["Alkaline Water Production", "Bottling", "Health Testing", "Distribution"]),
    ("coconut-water",   ["Coconut Water Processing", "Bottling", "Private Label", "Distribution"]),
    ("flavored-water",  ["Flavored Water Manufacturing", "Bottling", "Private Label", "Distribution"]),
    ("water",           ["Water Production", "Bottling", "Distribution", "Quality Testing"]),
    ("soft-drink",      ["Beverage Manufacturing", "Carbonation", "Packaging", "Distribution"]),
    ("energy-drink",    ["Energy Drink Manufacturing", "Formulation", "Packaging", "Distribution"]),
    ("sports-drink",    ["Sports Drink Manufacturing", "Formulation", "Private Label", "Distribution"]),
    ("fruit-juice",     ["Juice Processing", "Cold Press", "Packaging", "Distribution"]),
    ("cold-pressed",    ["Cold Press Juice", "Processing", "Bottling", "Distribution"]),
    ("kombucha",        ["Kombucha Brewing", "Fermentation", "Bottling", "Distribution"]),
    ("beer",            ["Brewing", "Fermentation", "Packaging", "Distribution"]),
    ("craft-beer",      ["Craft Brewing", "Recipe Development", "Packaging", "Distribution"]),
    ("whiskey",         ["Distilling", "Aging", "Bottling", "Export"]),
    ("vodka",           ["Distilling", "Filtration", "Bottling", "Export"]),
    ("wine",            ["Wine Production", "Fermentation", "Bottling", "Export"]),
    ("champagne",       ["Champagne Production", "Secondary Fermentation", "Bottling", "Distribution"]),
    ("spirits",         ["Distilling", "Aging", "Bottling", "Export"]),
    ("dairy-milk",      ["Milk Processing", "Pasteurization", "Packaging", "Distribution"]),
    ("oat-milk",        ["Plant Milk Production", "Processing", "Packaging", "Distribution"]),
    ("almond-milk",     ["Plant Milk Production", "Processing", "Packaging", "Distribution"]),
    ("plant-based-milk",["Plant Milk Manufacturing", "Processing", "Packaging", "Distribution"]),
    ("milk",            ["Dairy Processing", "Pasteurization", "Cold Chain", "Distribution"]),
    ("cheese",          ["Cheese Manufacturing", "Aging", "Packaging", "Distribution"]),
    ("butter",          ["Butter Manufacturing", "Dairy Processing", "Bulk Supply", "Private Label"]),
    ("ghee",            ["Ghee Manufacturing", "Clarification", "Packaging", "Export"]),
    ("yogurt",          ["Yogurt Manufacturing", "Fermentation", "Packaging", "Distribution"]),
    ("ice-cream",       ["Ice Cream Manufacturing", "Freezing", "Packaging", "Distribution"]),
    ("gelato",          ["Gelato Manufacturing", "Artisan Production", "Packaging", "Distribution"]),
    ("cooking-oil",     ["Oil Refining", "Packaging", "Bulk Supply", "Distribution"]),
    ("olive-oil",       ["Olive Oil Production", "Cold Press", "Bottling", "Export"]),
    ("palm-oil",        ["Palm Oil Processing", "Refining", "Bulk Supply", "Distribution"]),
    ("bread",           ["Bakery Manufacturing", "Artisan Baking", "Supply", "Distribution"]),
    ("bakery",          ["Bakery Manufacturing", "Contract Baking", "Private Label", "Distribution"]),
    ("biscuit",         ["Biscuit Manufacturing", "Packaging", "Private Label", "Distribution"]),
    ("chocolate",       ["Chocolate Manufacturing", "Confectionery", "Private Label", "Bulk Supply"]),
    ("candy",           ["Candy Manufacturing", "Confectionery", "Packaging", "Distribution"]),
    ("snack",           ["Snack Manufacturing", "Contract Production", "Packaging", "Distribution"]),
    ("meat",            ["Meat Processing", "Cold Chain", "Wholesale Supply", "Distribution"]),
    ("poultry",         ["Poultry Processing", "Cold Chain", "Packaging", "Distribution"]),
    ("seafood",         ["Seafood Processing", "Cold Chain", "Import/Export", "Distribution"]),
    ("spice",           ["Spice Processing", "Grinding", "Packaging", "Export"]),
    ("sauce",           ["Sauce Manufacturing", "Processing", "Private Label", "Distribution"]),
    ("pasta",           ["Pasta Manufacturing", "Drying", "Packaging", "Distribution"]),
    ("rice",            ["Rice Milling", "Processing", "Packaging", "Export"]),
    ("flour",           ["Flour Milling", "Processing", "Bulk Supply", "Distribution"]),
    ("sugar",           ["Sugar Manufacturing", "Refining", "Bulk Supply", "Distribution"]),
    ("honey",           ["Honey Processing", "Filtering", "Packaging", "Export"]),
    ("coffee",          ["Coffee Roasting", "Distribution", "Private Label", "Packaging"]),
    ("tea",             ["Tea Processing", "Blending", "Packaging", "Export"]),
    ("food-service",    ["Catering", "Food Preparation", "Event Services", "Meal Planning"]),
    ("restaurant",      ["Food Service", "Catering", "Menu Development", "Kitchen Operations"]),
    ("food",            ["Food Manufacturing", "Processing", "Packaging", "Distribution"]),
    ("beverage",        ["Beverage Manufacturing", "Processing", "Packaging", "Distribution"]),
    # ── Technology ───────────────────────────────────────────────────────────
    ("artificial-intelligence", ["AI Development", "ML Models", "Data Analytics", "Consulting"]),
    ("machine-learning",        ["ML Development", "Model Training", "Data Science", "Consulting"]),
    ("blockchain",              ["Smart Contracts", "DApp Development", "Web3 Consulting", "Integration"]),
    ("quantum-computing",       ["Quantum Computing R&D", "Algorithm Development", "Consulting", "Research"]),
    ("cloud-computing",         ["Cloud Infrastructure", "Managed Services", "Migration", "DevOps"]),
    ("saas",                    ["SaaS Development", "Product Management", "Integration", "Support"]),
    ("cybersecur",              ["Security Consulting", "Penetration Testing", "Compliance", "Managed Security"]),
    ("iot",                     ["IoT Platform", "Hardware Development", "Integration", "Analytics"]),
    ("ar-vr",                   ["AR/VR Development", "Immersive Experiences", "3D Content", "Consulting"]),
    ("3d-printing",             ["3D Printing", "Additive Manufacturing", "Prototyping", "Design"]),
    ("robotics",                ["Robotics Manufacturing", "Automation", "Integration", "Maintenance"]),
    ("automation",              ["Industrial Automation", "PLC Programming", "Integration", "Maintenance"]),
    ("semiconductor",           ["Chip Design", "Wafer Manufacturing", "Testing", "Supply Chain"]),
    ("chip",                    ["Chip Design", "Semiconductor Manufacturing", "Testing", "Supply"]),
    ("computer",                ["Hardware Supply", "IT Solutions", "System Integration", "Maintenance"]),
    ("satellite",               ["Satellite Systems", "Ground Stations", "Data Services", "Consulting"]),
    ("telecom",                 ["Network Infrastructure", "Connectivity Solutions", "Managed Services", "Consulting"]),
    ("web-software",            ["Web Development", "Mobile Apps", "UI/UX Design", "Support"]),
    ("software",                ["Custom Development", "SaaS Solutions", "System Integration", "Support"]),
    ("information-technology",  ["IT Consulting", "Managed Services", "Software Development", "Support"]),
    ("smart-home",              ["Smart Home Installation", "Automation", "Integration", "Support"]),
    ("supply-chain-technology", ["Supply Chain Software", "TMS", "WMS", "Analytics"]),
    ("human-resources-tech",    ["HR Software", "HRIS", "Payroll Systems", "Talent Management"]),
    ("property-technology",     ["PropTech Solutions", "Property Management", "Listing Platforms", "Analytics"]),
    ("travel-technology",       ["Travel Tech Platforms", "Booking Systems", "GDS Integration", "Analytics"]),
    ("agriculture-technology",  ["AgriTech Solutions", "Precision Farming", "IoT Sensors", "Analytics"]),
    # ── Healthcare ───────────────────────────────────────────────────────────
    ("pharmaceutical",  ["Drug Manufacturing", "R&D", "Quality Assurance", "Regulatory Affairs"]),
    ("biotech",         ["Biotech R&D", "Clinical Trials", "Manufacturing", "Regulatory Affairs"]),
    ("medical-device",  ["Medical Device Manufacturing", "R&D", "Regulatory", "Distribution"]),
    ("medical-equip",   ["Medical Equipment Supply", "Installation", "Maintenance", "Training"]),
    ("dental",          ["Dental Equipment", "Consumables", "Distribution", "Technical Support"]),
    ("hospital",        ["Healthcare Services", "Diagnostics", "Treatment", "Consultation"]),
    ("healthtech",      ["Health Tech Platforms", "Telemedicine", "EHR Systems", "Analytics"]),
    ("telemedicine",    ["Telemedicine Platform", "Virtual Consultations", "Remote Monitoring", "EMR"]),
    ("healthcare-wellness", ["Wellness Programs", "Preventive Care", "Health Coaching", "Fitness"]),
    ("healthcare",      ["Healthcare Services", "Clinical Services", "Diagnostics", "Consultation"]),
    ("veterinary",      ["Veterinary Services", "Animal Care", "Surgery", "Diagnostics"]),
    ("childcare",       ["Childcare Services", "Early Education", "After-School Programs", "Tutoring"]),
    ("eldercare",       ["Elder Care", "Assisted Living", "Home Care", "Rehabilitation"]),
    # ── Manufacturing ────────────────────────────────────────────────────────
    ("cnc",             ["CNC Machining", "Precision Parts", "Prototyping", "Assembly"]),
    ("forging",         ["Metal Forging", "Heat Treatment", "Quality Testing", "Supply"]),
    ("casting",         ["Metal Casting", "Finishing", "Quality Control", "Supply"]),
    ("welding",         ["Welding Services", "Fabrication", "Assembly", "Installation"]),
    ("plastic",         ["Plastic Molding", "Extrusion", "Tooling", "Custom Parts"]),
    ("rubber",          ["Rubber Manufacturing", "Molding", "Compounding", "Supply"]),
    ("glass",           ["Glass Manufacturing", "Cutting", "Tempering", "Distribution"]),
    ("steel",           ["Steel Manufacturing", "Fabrication", "Distribution", "Processing"]),
    ("aluminum",        ["Aluminum Extrusion", "Fabrication", "Casting", "Distribution"]),
    ("copper",          ["Copper Manufacturing", "Wire Drawing", "Fabrication", "Distribution"]),
    ("iron",            ["Iron Casting", "Fabrication", "Distribution", "Processing"]),
    ("pipe",            ["Pipe Manufacturing", "Fitting", "Distribution", "Installation"]),
    ("valve",           ["Valve Manufacturing", "Testing", "Distribution", "Installation"]),
    ("pump",            ["Pump Manufacturing", "Testing", "Distribution", "Maintenance"]),
    ("bearing",         ["Bearing Manufacturing", "Distribution", "Quality Testing", "Technical Support"]),
    ("fastener",        ["Fastener Manufacturing", "Distribution", "Custom Orders", "Quality Control"]),
    ("spring",          ["Spring Manufacturing", "Custom Design", "Testing", "Distribution"]),
    ("cable",           ["Cable Manufacturing", "Installation", "Testing", "Distribution"]),
    ("wire",            ["Wire Drawing", "Fabrication", "Distribution", "Electrical Solutions"]),
    ("motor",           ["Motor Manufacturing", "Testing", "Distribution", "Maintenance"]),
    ("transformer",     ["Transformer Manufacturing", "Testing", "Installation", "Maintenance"]),
    ("machinery",       ["Machinery Manufacturing", "Installation", "Maintenance", "Spare Parts"]),
    ("industrial-equip",["Equipment Supply", "Installation", "Maintenance", "Training"]),
    ("packaging",       ["Packaging Manufacturing", "Custom Design", "Supply", "Distribution"]),
    ("printing",        ["Printing Services", "Design", "Packaging", "Distribution"]),
    ("paper",           ["Paper Manufacturing", "Pulp Processing", "Distribution", "Recycling"]),
    ("wood",            ["Wood Processing", "Furniture Manufacturing", "Distribution", "Export"]),
    ("furniture",       ["Furniture Manufacturing", "Custom Design", "Installation", "Export"]),
    ("mattress",        ["Mattress Manufacturing", "Foam Processing", "Distribution", "Retail"]),
    ("textile",         ["Fabric Manufacturing", "Dyeing", "Finishing", "Export"]),
    ("garment",         ["Garment Manufacturing", "Design", "Finishing", "Export"]),
    ("apparel",         ["Apparel Manufacturing", "Design", "Quality Control", "Export"]),
    ("footwear",        ["Footwear Manufacturing", "Design", "Quality Control", "Export"]),
    ("shoe",            ["Shoe Manufacturing", "Design", "Quality Control", "Export"]),
    ("leather",         ["Leather Processing", "Tanning", "Finishing", "Export"]),
    ("jewelry",         ["Jewelry Manufacturing", "Design", "Polishing", "Export"]),
    ("gem",             ["Gemstone Processing", "Cutting", "Polishing", "Export"]),
    ("diamond",         ["Diamond Cutting", "Polishing", "Grading", "Trading"]),
    ("watch",           ["Watch Manufacturing", "Assembly", "Quality Control", "Distribution"]),
    ("toy",             ["Toy Manufacturing", "Design", "Safety Testing", "Distribution"]),
    ("sport",           ["Sports Equipment Manufacturing", "Distribution", "Retail", "Customization"]),
    ("fitness",         ["Fitness Equipment Manufacturing", "Distribution", "Installation", "Maintenance"]),
    ("gym",             ["Gym Equipment Supply", "Installation", "Maintenance", "Consulting"]),
    # ── Chemicals ────────────────────────────────────────────────────────────
    ("chemical",        ["Chemical Manufacturing", "R&D", "Quality Testing", "Distribution"]),
    ("petrochemical",   ["Petrochemical Processing", "Refining", "Distribution", "Trading"]),
    ("fertilizer",      ["Fertilizer Manufacturing", "Soil Testing", "Agronomy Consulting", "Distribution"]),
    ("agrochemical",    ["Agrochemical Manufacturing", "R&D", "Distribution", "Technical Support"]),
    ("cosmetic",        ["Cosmetic Manufacturing", "Formulation", "Private Label", "Distribution"]),
    ("personal-care",   ["Personal Care Products", "Formulation", "Private Label", "Distribution"]),
    ("cleaning",        ["Cleaning Products Manufacturing", "Distribution", "Private Label", "Consulting"]),
    ("paint",           ["Paint Manufacturing", "Colour Consulting", "Distribution", "Technical Support"]),
    ("adhesive",        ["Adhesive Manufacturing", "Formulation", "Distribution", "Technical Support"]),
    ("resin",           ["Resin Manufacturing", "Compounding", "Distribution", "Technical Support"]),
    # ── Energy ───────────────────────────────────────────────────────────────
    ("solar-panel",     ["Solar Panel Manufacturing", "Supply", "Quality Testing", "Distribution"]),
    ("solar",           ["Solar Installation", "EPC Services", "O&M", "Energy Consulting"]),
    ("wind",            ["Wind Energy", "Turbine Installation", "O&M", "Grid Integration"]),
    ("battery",         ["Battery Manufacturing", "Energy Storage", "R&D", "Supply"]),
    ("electric-vehicles",["EV Manufacturing", "Charging Infrastructure", "Fleet Solutions", "Consulting"]),
    ("electric-vehicle",["EV Manufacturing", "Charging Infrastructure", "Fleet Solutions", "Consulting"]),
    ("electric",        ["EV Solutions", "Charging Stations", "Fleet Electrification", "Consulting"]),
    ("nuclear",         ["Nuclear Engineering", "Safety Consulting", "Operations", "Maintenance"]),
    ("renewable-energy",["Renewable Energy Development", "EPC", "O&M", "Energy Consulting"]),
    ("oil-gas",         ["Exploration", "Production", "Refining", "Distribution"]),
    ("propane",         ["Propane Distribution", "Storage", "Safety Services", "Installation"]),
    ("energy",          ["Energy Solutions", "Consulting", "Project Development", "O&M"]),
    # ── Construction & Real Estate ────────────────────────────────────────────
    ("cement",          ["Cement Manufacturing", "Ready Mix", "Distribution", "Technical Support"]),
    ("concrete",        ["Concrete Manufacturing", "Precast", "Delivery", "Technical Support"]),
    ("brick",           ["Brick Manufacturing", "Supply", "Distribution", "Technical Support"]),
    ("construction",    ["Building Construction", "Project Management", "Design", "Renovation"]),
    ("architecture",    ["Architectural Design", "3D Visualization", "Consulting", "Project Management"]),
    ("interior-design", ["Interior Design", "Space Planning", "Procurement", "Project Management"]),
    ("elevator",        ["Elevator Manufacturing", "Installation", "Maintenance", "Modernization"]),
    ("hvac",            ["HVAC Installation", "Maintenance", "Energy Audits", "Design"]),
    ("plumbing",        ["Plumbing Installation", "Maintenance", "Repair", "Inspection"]),
    ("electrical",      ["Electrical Installation", "Maintenance", "Inspection", "Design"]),
    ("roofing",         ["Roofing Installation", "Repair", "Waterproofing", "Inspection"]),
    ("flooring",        ["Flooring Supply", "Installation", "Maintenance", "Polishing"]),
    ("kitchen-bath",    ["Kitchen Remodeling", "Bathroom Renovation", "Design", "Installation"]),
    ("real-estate-agent",["Property Sales", "Rental Management", "Valuation", "Consulting"]),
    ("real-estate",     ["Real Estate Development", "Property Management", "Leasing", "Consulting"]),
    ("property",        ["Property Management", "Leasing", "Valuation", "Consulting"]),
    # ── Agriculture ──────────────────────────────────────────────────────────
    ("seed",            ["Seed Production", "R&D", "Distribution", "Agronomic Support"]),
    ("grain",           ["Grain Trading", "Storage", "Processing", "Export"]),
    ("wheat",           ["Wheat Trading", "Milling", "Storage", "Export"]),
    ("corn",            ["Corn Trading", "Processing", "Storage", "Export"]),
    ("soybean",         ["Soybean Processing", "Oil Extraction", "Trading", "Export"]),
    ("cotton",          ["Cotton Ginning", "Trading", "Processing", "Export"]),
    ("greenhouse",      ["Greenhouse Manufacturing", "Horticulture", "Plant Supply", "Consulting"]),
    ("farm",            ["Farming", "Crop Management", "Harvest", "Supply Chain"]),
    ("agriculture",     ["Farming", "Crop Management", "Agronomy Services", "Supply Chain"]),
    ("agri",            ["Agricultural Services", "Crop Management", "Distribution", "Consulting"]),
    # ── Automotive ───────────────────────────────────────────────────────────
    ("car",             ["Vehicle Manufacturing", "Parts Supply", "After-Sales Service", "Engineering"]),
    ("truck",           ["Truck Manufacturing", "Parts Supply", "Fleet Services", "Maintenance"]),
    ("motorcycle",      ["Motorcycle Manufacturing", "Parts Supply", "After-Sales Service", "Distribution"]),
    ("tire",            ["Tire Manufacturing", "Distribution", "Retreading", "Fleet Services"]),
    ("auto-part",       ["Auto Parts Manufacturing", "Distribution", "Quality Testing", "Supply"]),
    ("auto-repair",     ["Auto Repair", "Diagnostics", "Maintenance", "Parts Supply"]),
    ("automotive-service", ["Auto Services", "Repair", "Maintenance", "Fleet Management"]),
    ("automotive",      ["Vehicle Manufacturing", "Parts Supply", "After-Sales Service", "Engineering"]),
    # ── Logistics ────────────────────────────────────────────────────────────
    ("freight",         ["Freight Forwarding", "Customs Clearance", "Warehousing", "Documentation"]),
    ("shipping",        ["Ocean Freight", "Port Services", "Customs", "Documentation"]),
    ("marine",          ["Marine Shipping", "Port Services", "Ship Management", "Logistics"]),
    ("drone",           ["Drone Delivery", "Fleet Management", "Logistics Tech", "Operations"]),
    ("warehouse",       ["Warehousing", "Inventory Management", "Pick & Pack", "Distribution"]),
    ("courier",         ["Courier Services", "Last Mile Delivery", "Tracking", "B2C Logistics"]),
    ("logistics",       ["Freight Forwarding", "Warehousing", "Last Mile Delivery", "Supply Chain"]),
    # ── Metals & Mining ──────────────────────────────────────────────────────
    ("gold",            ["Gold Mining", "Refining", "Trading", "Jewelry Manufacturing"]),
    ("silver",          ["Silver Mining", "Refining", "Trading", "Industrial Supply"]),
    ("iron-ore",        ["Iron Ore Mining", "Processing", "Trading", "Export"]),
    ("coal",            ["Coal Mining", "Processing", "Trading", "Export"]),
    ("mining",          ["Mining Operations", "Extraction", "Processing", "Export"]),
    ("metal",           ["Metal Manufacturing", "Fabrication", "Distribution", "Recycling"]),
    # ── Professional Services ─────────────────────────────────────────────────
    ("accounting",      ["Accounting", "Tax Filing", "Audit", "Financial Reporting"]),
    ("tax",             ["Tax Consulting", "GST/VAT", "Filing", "Tax Planning"]),
    ("legal",           ["Legal Consulting", "Contract Review", "Compliance", "Litigation"]),
    ("staffing",        ["Staffing Solutions", "Executive Search", "Temp Staffing", "HR Consulting"]),
    ("hr",              ["HR Consulting", "Recruitment", "Payroll", "Training"]),
    ("consulting",      ["Management Consulting", "Strategy", "Implementation", "Training"]),
    ("marketing",       ["Digital Marketing", "Branding", "Content Creation", "SEO/SEM"]),
    ("advertising",     ["Advertising", "Media Planning", "Creative Services", "Campaign Management"]),
    ("media",           ["Media Production", "Publishing", "Broadcasting", "Digital Content"]),
    ("photography",     ["Photography", "Videography", "Editing", "Commercial Shoots"]),
    ("design",          ["Graphic Design", "Brand Identity", "UX/UI", "Print Design"]),
    ("financial-service",["Financial Consulting", "Investment Advisory", "Wealth Management", "Planning"]),
    ("insurance",       ["Insurance Products", "Risk Assessment", "Claims Management", "Advisory"]),
    ("banking",         ["Banking Services", "Loans", "Investment", "Trade Finance"]),
    ("professional",    ["Professional Consulting", "Strategy", "Advisory", "Implementation"]),
    # ── Education ────────────────────────────────────────────────────────────
    ("edtech",          ["E-Learning Platform", "LMS", "Course Development", "Virtual Training"]),
    ("education",       ["Training Programs", "Curriculum Development", "Assessment", "Certification"]),
    ("childcare",       ["Childcare", "Early Education", "After-School", "Tutoring"]),
    # ── Retail & E-Commerce ───────────────────────────────────────────────────
    ("e-commerce",      ["E-Commerce Development", "Marketplace Setup", "Payment Integration", "Logistics"]),
    ("retail",          ["Retail Operations", "Merchandising", "Store Design", "Supply Chain"]),
    ("supermarket",     ["Retail Operations", "Category Management", "Supply Chain", "Private Label"]),
    # ── Hospitality & Tourism ─────────────────────────────────────────────────
    ("hotel",           ["Hotel Management", "Hospitality Services", "Revenue Management", "F&B"]),
    ("travel",          ["Travel Planning", "Tour Operations", "Booking Services", "Hospitality"]),
    ("tourism",         ["Tourism Services", "Destination Management", "Tour Operations", "Guides"]),
    ("wedding",         ["Wedding Planning", "Event Coordination", "Venue Management", "Catering"]),
    ("event",           ["Event Planning", "Event Management", "AV Services", "Catering"]),
    # ── Environment ──────────────────────────────────────────────────────────
    ("waste",           ["Waste Collection", "Recycling", "Waste Treatment", "Environmental Consulting"]),
    ("recycling",       ["Recycling Services", "Material Recovery", "Waste Management", "Consulting"]),
    ("water-sanitation",["Water Treatment", "Sanitation Services", "Infrastructure", "Consulting"]),
    ("environmental",   ["Environmental Consulting", "Impact Assessment", "Compliance", "Remediation"]),
    # ── Beauty & Personal Care ────────────────────────────────────────────────
    ("salon",           ["Hair Styling", "Beauty Treatments", "Spa Services", "Grooming"]),
    ("spa",             ["Spa Services", "Massage", "Skin Care", "Wellness Treatments"]),
    ("beauty",          ["Beauty Products", "Cosmetics", "Skin Care", "Personal Care"]),
    # ── Home Services ─────────────────────────────────────────────────────────
    ("home-service",    ["Home Repairs", "Maintenance", "Renovation", "Installation"]),
    ("gardening",       ["Landscaping", "Garden Maintenance", "Planting", "Irrigation"]),
    ("laundry",         ["Laundry Services", "Dry Cleaning", "Alteration", "Pickup & Delivery"]),
    ("storage",         ["Storage Solutions", "Moving Services", "Packing", "Logistics"]),
    ("cleaning-service",["Cleaning Services", "Deep Cleaning", "Disinfection", "Janitorial"]),
    # ── Government & NGO ──────────────────────────────────────────────────────
    ("government",      ["Public Services", "Policy Consulting", "E-Government", "Infrastructure"]),
    ("ngo",             ["Social Programs", "Community Development", "Fundraising", "Advocacy"]),
    ("social-impact",   ["Social Programs", "Impact Assessment", "Community Development", "Advocacy"]),
    # ── Default ───────────────────────────────────────────────────────────────
    ("default",         ["Manufacturing", "Supply", "Distribution", "Quality Control"]),
]

# keyword → [list of industries served]
INDUSTRY_MAP = [
    # Food & Beverage
    ("water",           ["Food & Beverage", "Retail", "Hospitality", "Healthcare"]),
    ("beverage",        ["Food & Beverage", "Retail", "HoReCa", "E-Commerce"]),
    ("beer",            ["Food & Beverage", "Retail", "Hospitality", "Entertainment"]),
    ("wine",            ["Food & Beverage", "Retail", "Hospitality", "Export"]),
    ("spirits",         ["Food & Beverage", "Retail", "Hospitality", "Export"]),
    ("dairy",           ["Food & Beverage", "Retail", "Food Service", "Healthcare"]),
    ("cheese",          ["Food & Beverage", "Retail", "HoReCa", "Food Service"]),
    ("butter",          ["Food & Beverage", "Retail", "Food Processing", "Bakery"]),
    ("milk",            ["Food & Beverage", "Retail", "Healthcare", "Food Service"]),
    ("bakery",          ["Food & Beverage", "Retail", "HoReCa", "Food Service"]),
    ("chocolate",       ["Food & Beverage", "Retail", "Confectionery", "Gifting"]),
    ("snack",           ["Food & Beverage", "Retail", "E-Commerce", "Vending"]),
    ("meat",            ["Food & Beverage", "Retail", "HoReCa", "Food Service"]),
    ("seafood",         ["Food & Beverage", "Retail", "HoReCa", "Export"]),
    ("coffee",          ["Food & Beverage", "Retail", "Hospitality", "Office"]),
    ("food",            ["Food & Beverage", "Retail", "HoReCa", "Healthcare"]),
    ("restaurant",      ["Food Service", "Hospitality", "Retail", "Events"]),
    # Technology
    ("artificial-intelligence",["Technology", "Healthcare", "Finance", "Manufacturing", "Retail"]),
    ("blockchain",      ["Finance", "Technology", "Supply Chain", "Healthcare"]),
    ("quantum",         ["Technology", "Defense", "Research", "Finance"]),
    ("cloud",           ["Technology", "Finance", "Healthcare", "Retail", "Education"]),
    ("cybersecur",      ["Technology", "Finance", "Healthcare", "Government", "Defense"]),
    ("iot",             ["Manufacturing", "Healthcare", "Retail", "Agriculture", "Smart Cities"]),
    ("robotics",        ["Manufacturing", "Healthcare", "Logistics", "Automotive", "Agriculture"]),
    ("semiconductor",   ["Electronics", "Automotive", "Aerospace", "Consumer Electronics"]),
    ("software",        ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"]),
    ("telecom",         ["Telecom", "Government", "Enterprise", "Consumer"]),
    ("information-technology",["Technology", "Finance", "Healthcare", "Government", "Retail"]),
    ("edtech",          ["Education", "Corporate Training", "Government", "Non-Profit"]),
    # Healthcare
    ("pharma",          ["Healthcare", "Hospitals", "Retail Pharmacy", "Research"]),
    ("biotech",         ["Healthcare", "Pharmaceutical", "Research", "Agriculture"]),
    ("medical",         ["Healthcare", "Hospitals", "Clinics", "Research"]),
    ("dental",          ["Healthcare", "Dental Clinics", "Hospitals", "Retail"]),
    ("hospital",        ["Healthcare", "Government", "Insurance", "Pharma"]),
    ("healthtech",      ["Healthcare", "Insurance", "Government", "Wellness"]),
    ("veterinary",      ["Agriculture", "Pet Care", "Research", "Livestock"]),
    ("healthcare",      ["Healthcare", "Insurance", "Government", "Wellness"]),
    # Manufacturing
    ("cnc",             ["Manufacturing", "Aerospace", "Automotive", "Defense"]),
    ("forging",         ["Manufacturing", "Automotive", "Aerospace", "Oil & Gas"]),
    ("steel",           ["Manufacturing", "Construction", "Automotive", "Infrastructure"]),
    ("aluminum",        ["Manufacturing", "Aerospace", "Automotive", "Construction"]),
    ("plastic",         ["Manufacturing", "Automotive", "Consumer Goods", "Healthcare"]),
    ("glass",           ["Construction", "Automotive", "Retail", "Consumer Goods"]),
    ("textile",         ["Fashion", "Retail", "Home Textiles", "Industrial"]),
    ("apparel",         ["Fashion", "Retail", "Sports", "Corporate"]),
    ("furniture",       ["Real Estate", "Retail", "Hospitality", "Office"]),
    ("packaging",       ["Food & Beverage", "Pharma", "Retail", "Manufacturing"]),
    ("machinery",       ["Manufacturing", "Agriculture", "Construction", "Mining"]),
    # Energy
    ("solar",           ["Energy", "Construction", "Agriculture", "Government"]),
    ("wind",            ["Energy", "Government", "Utilities", "Construction"]),
    ("battery",         ["Automotive", "Electronics", "Energy", "Manufacturing"]),
    ("electric-vehicle",["Automotive", "Transportation", "Government", "Fleet"]),
    ("renewable",       ["Energy", "Government", "Utilities", "Construction"]),
    ("nuclear",         ["Energy", "Government", "Defense", "Research"]),
    ("energy",          ["Energy", "Government", "Industrial", "Commercial"]),
    # Construction
    ("cement",          ["Construction", "Infrastructure", "Real Estate", "Government"]),
    ("construction",    ["Real Estate", "Infrastructure", "Government", "Commercial"]),
    ("architecture",    ["Real Estate", "Government", "Commercial", "Residential"]),
    ("interior",        ["Real Estate", "Hospitality", "Commercial", "Residential"]),
    ("elevator",        ["Real Estate", "Construction", "Hospitality", "Healthcare"]),
    ("hvac",            ["Construction", "Real Estate", "Hospitality", "Healthcare"]),
    ("real-estate",     ["Real Estate", "Finance", "Government", "Retail"]),
    # Agriculture
    ("fertilizer",      ["Agriculture", "Food & Beverage", "Government", "Export"]),
    ("seed",            ["Agriculture", "Food & Beverage", "Government", "Research"]),
    ("agriculture",     ["Agriculture", "Food & Beverage", "Government", "Export"]),
    ("farm",            ["Agriculture", "Food & Beverage", "Government", "Retail"]),
    # Automotive
    ("automotive",      ["Automotive", "Transportation", "Manufacturing", "Fleet"]),
    ("tire",            ["Automotive", "Transportation", "Manufacturing", "Retail"]),
    ("auto-repair",     ["Automotive", "Transportation", "Fleet", "Consumer"]),
    # Logistics
    ("logistics",       ["Retail", "Manufacturing", "E-Commerce", "Healthcare"]),
    ("shipping",        ["Trade", "Manufacturing", "Retail", "Government"]),
    ("freight",         ["Trade", "Manufacturing", "Retail", "Agriculture"]),
    ("marine",          ["Shipping", "Oil & Gas", "Trade", "Defense"]),
    # Metals & Mining
    ("mining",          ["Mining", "Manufacturing", "Construction", "Export"]),
    ("metal",           ["Manufacturing", "Construction", "Automotive", "Aerospace"]),
    # Professional Services
    ("accounting",      ["Finance", "SMBs", "Startups", "Enterprise"]),
    ("legal",           ["Legal", "Finance", "Real Estate", "Corporate"]),
    ("staffing",        ["Technology", "Healthcare", "Finance", "Manufacturing"]),
    ("marketing",       ["Retail", "Technology", "Healthcare", "Finance"]),
    ("media",           ["Media", "Entertainment", "Advertising", "Retail"]),
    ("financial",       ["Finance", "Banking", "Insurance", "Real Estate"]),
    ("consulting",      ["Technology", "Finance", "Healthcare", "Manufacturing"]),
    ("professional",    ["Technology", "Finance", "Healthcare", "Manufacturing"]),
    # Beauty & Lifestyle
    ("beauty",          ["Retail", "E-Commerce", "Hospitality", "Healthcare"]),
    ("cosmetic",        ["Retail", "E-Commerce", "Hospitality", "Healthcare"]),
    ("salon",           ["Consumer", "Retail", "Hospitality", "Wellness"]),
    ("fitness",         ["Wellness", "Sports", "Healthcare", "Corporate"]),
    ("sport",           ["Sports", "Retail", "Healthcare", "Education"]),
    # Real Estate
    ("property",        ["Real Estate", "Finance", "Government", "Commercial"]),
    # Environment
    ("waste",           ["Government", "Manufacturing", "Healthcare", "Construction"]),
    ("environmental",   ["Government", "Manufacturing", "Energy", "Construction"]),
    # Remaining specific categories (industries served)
    ("jewelry",         ["Luxury", "Retail", "E-Commerce", "Export"]),
    ("gems",            ["Luxury", "Retail", "Jewelry", "Export"]),
    ("diamond",         ["Luxury", "Jewelry", "Finance", "Export"]),
    ("watch",           ["Luxury", "Retail", "Corporate Gifting", "E-Commerce"]),
    ("ar-vr",           ["Technology", "Gaming", "Healthcare", "Education"]),
    ("extended-reality",["Technology", "Gaming", "Healthcare", "Education"]),
    ("electric-vehicles",["Automotive", "Transportation", "Government", "Fleet"]),
    ("electric",        ["Automotive", "Transportation", "Energy", "Consumer"]),
    ("wedding",         ["Events", "Hospitality", "Consumer", "Retail"]),
    ("events",          ["Events", "Entertainment", "Corporate", "Hospitality"]),
    ("immigration",     ["Legal", "Government", "Corporate", "Consumer"]),
    ("notary",          ["Legal", "Real Estate", "Finance", "Government"]),
    ("music",           ["Entertainment", "Media", "Retail", "Events"]),
    ("audio",           ["Entertainment", "Media", "Events", "Consumer Electronics"]),
    ("social-impact",   ["Non-Profit", "Government", "Healthcare", "Education"]),
    ("government",      ["Government", "Infrastructure", "Education", "Healthcare"]),
    ("ngo",             ["Non-Profit", "Government", "Healthcare", "Education"]),
    ("storage",         ["Retail", "Manufacturing", "Real Estate", "Consumer"]),
    ("laundry",         ["Consumer", "Hospitality", "Healthcare", "Retail"]),
    ("supplies",        ["Manufacturing", "Healthcare", "Education", "Retail"]),
    ("gardening",       ["Consumer", "Retail", "Real Estate", "Agriculture"]),
    ("cleaning",        ["Commercial", "Healthcare", "Hospitality", "Residential"]),
    # Default
    ("default",         ["Manufacturing", "Industrial", "B2B", "Export"]),
]


def _slug_match(key: str, slug: str) -> bool:
    """Match key as a whole word within a hyphen-delimited slug."""
    padded = f"-{slug}-"
    return f"-{key}-" in padded or padded.startswith(f"-{key}-") or padded.endswith(f"-{key}-")


def get_services(category_slug: str) -> list[str]:
    slug = category_slug.lower()
    for key, services in SERVICE_MAP:
        if _slug_match(key, slug):
            return services
    return dict(SERVICE_MAP)["default"]


def get_industries(category_slug: str) -> list[str]:
    slug = category_slug.lower()
    for key, industries in INDUSTRY_MAP:
        if _slug_match(key, slug):
            return industries
    return dict(INDUSTRY_MAP)["default"]


def get_client_focus(employees: str) -> tuple[int, int, int]:
    """Return (small%, medium%, large%) based on employee count."""
    emp = employees.lower() if employees else ""
    if any(x in emp for x in ["1-10", "11-50", "1-50"]):
        return 60, 30, 10
    elif any(x in emp for x in ["51-100", "101-250"]):
        return 30, 50, 20
    elif any(x in emp for x in ["251-500", "501-1000"]):
        return 20, 40, 40
    elif any(x in emp for x in ["1001", "5001", "10000"]):
        return 10, 30, 60
    return 33, 34, 33


def get_service_focus(category_slug: str, services: list[str]) -> str:
    import json
    n = len(services)
    if n == 0:
        return "[]"
    if n == 1:
        percs = [100]
    elif n == 2:
        percs = [60, 40]
    elif n == 3:
        percs = [45, 35, 20]
    else:
        percs = [40, 25, 20, 15] + [0] * (n - 4)
    result = [{"service": s, "percentage": p} for s, p in zip(services, percs) if p > 0]
    return json.dumps(result)


def get_pricing_model(category_slug: str, employees: str = "") -> str:
    slug = category_slug.lower()
    hourly_keywords = [
        "software", "consulting", "advisory", "service", "staffing", "marketing",
        "design", "legal", "accounting", "tax", "media", "photography", "edtech",
        "healthtech", "hr", "recruitment", "architect", "interior", "financial",
        "telecom", "cloud", "saas", "iot", "ai", "blockchain", "cybersecur",
        "professional", "agency", "salon", "spa", "cleaning", "plumbing",
        "repair", "wedding", "event", "travel", "tourism",
    ]
    if any(kw in slug for kw in hourly_keywords):
        return "Hourly Rate"
    return "Project Based"


def get_min_project_size(employees: str) -> str:
    emp = employees.lower() if employees else ""
    if any(x in emp for x in ["1-10", "11-50"]):
        return "$1,000+"
    elif any(x in emp for x in ["51-100", "101-250"]):
        return "$5,000+"
    elif any(x in emp for x in ["251-500", "501-1000"]):
        return "$10,000+"
    elif any(x in emp for x in ["1001", "5001"]):
        return "$50,000+"
    return "$5,000+"

# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


def load_slugs(parents_only: bool = False) -> list[tuple[str, str]]:
    """Return list of (type, slug) from the slugs file."""
    if not SLUGS_FILE.exists():
        print(f"  ERROR: {SLUGS_FILE} not found.")
        print("  Run the extraction step first — see script header.")
        sys.exit(1)

    results = []
    with open(SLUGS_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t")
            if len(parts) < 2:
                continue
            typ, slug = parts[0], parts[1]
            if parents_only and typ != "parent":
                continue
            results.append((typ, slug))
    return results


def load_progress() -> set[str]:
    """Return set of already-processed slugs from progress log."""
    done = set()
    if PROGRESS_CSV.exists():
        with open(PROGRESS_CSV, newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                if row.get("status") in ("ok", "empty", "no_results"):
                    done.add(row["slug"])
    return done


def log_progress(slug: str, status: str, count: int, total: Optional[int]):
    PROGRESS_CSV.parent.mkdir(parents=True, exist_ok=True)
    exists = PROGRESS_CSV.exists()
    with open(PROGRESS_CSV, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["timestamp", "slug", "status", "scraped", "total_on_site"])
        if not exists:
            w.writeheader()
        w.writerow({
            "timestamp":     datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "slug":          slug,
            "status":        status,
            "scraped":       count,
            "total_on_site": total if total is not None else "",
        })


def save_per_slug(companies: list[dict], slug: str):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / f"{slug}.csv"
    fields = ["name", "city", "state", "country", "employees", "founded", "description"]
    with open(out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(companies)


def append_master(companies: list[dict], category_slug: str):
    import json
    exists = MASTER_CSV.exists()
    services  = get_services(category_slug)
    industries = get_industries(category_slug)
    pricing   = get_pricing_model(category_slug, "")
    svc_focus = get_service_focus(category_slug, services)

    with open(MASTER_CSV, "a", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=MASTER_FIELDS, extrasaction="ignore")
        if not exists:
            w.writeheader()
        for c in companies:
            name = c.get("name", "").strip()
            employees = c.get("employees", "").replace(" Employees", "").replace(" employees", "")
            small, medium, large = get_client_focus(c.get("employees", ""))
            w.writerow({
                "name":                name,
                "slug":                slugify(name),
                "hq_city":             c.get("city", ""),
                "hq_state":            c.get("state", ""),
                "hq_country":          c.get("country", ""),
                "description":         c.get("description", ""),
                "founded_year":        c.get("founded", ""),
                "team_size":           employees,
                "logo_url":            (
                    f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}"
                    f"&background=4F46E5&color=fff&size=200&bold=true"
                ),
                "website":             "",
                "pricing_model":       pricing,
                "min_project_size":    get_min_project_size(c.get("employees", "")),
                "services_offered":    json.dumps(services),
                "industries_served":   json.dumps(industries),
                "client_focus_small":  small,
                "client_focus_medium": medium,
                "client_focus_large":  large,
                "service_focus":       svc_focus,
                "category_slug":       category_slug,
                "category_name":       category_slug.replace("-", " ").title(),
            })


# ── DOM extractors ────────────────────────────────────────────────────────────

async def extract_companies(page: Page) -> list[dict]:
    return await page.evaluate("""
        () => {
            const results = [];
            const cards = Array.from(document.querySelectorAll('.MuiPaper-root'));
            for (const card of cards) {
                const text = card.innerText || '';
                if (!text.includes('Employees')) continue;
                if (text.includes('Result configuration')) continue;

                const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
                if (!lines || lines.length < 4) continue;
                if (lines[0] === 'Filter') continue;

                const img = card.querySelector('img[alt]');
                const name = img ? img.alt.replace(/['\\u2019]s Logo$/, '').trim() : lines[0];
                if (!name) continue;

                const location = lines[1] || '';
                const locParts = location.split(',').map(s => s.trim());
                const city    = locParts[0] || '';
                const country = locParts[locParts.length - 1] || '';
                const state   = locParts.length >= 3 ? locParts[1] : '';

                const employees = (lines[3] || '').includes('Employees') ? lines[3] : '';
                const founded   = /^\\d{4}$/.test(lines[4] || '') ? lines[4] : '';

                let description = '';
                const ktIdx = lines.findIndex(l => l === 'Key takeaway');
                if (ktIdx !== -1 && lines[ktIdx + 1]) description = lines[ktIdx + 1];

                results.push({ name, city, state, country, employees, founded, description });
            }
            return results;
        }
    """)


async def get_count(page: Page) -> Optional[int]:
    text = await page.evaluate("() => document.body.innerText")
    for pattern in [r'(\d[\d,]+)\s+compan', r'Top\s+(\d[\d,]+)', r'Show\s+(\d[\d,]+)\s+result']:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return int(m.group(1).replace(',', ''))
    return None


async def has_results(page: Page) -> bool:
    """Quick check: does this page have any company cards?"""
    count = await page.evaluate("""
        () => document.querySelectorAll('.MuiPaper-root').length
    """)
    return count > 2  # >2 to skip header/filter cards


# ── Single slug scraper ───────────────────────────────────────────────────────

async def scrape_slug(
    page: Page,
    slug: str,
    limit: int = DEFAULT_LIMIT,
    dry_run: bool = False,
) -> tuple[list[dict], Optional[int], str]:
    """
    Returns (companies, total_count, status).
    status: 'ok' | 'empty' | 'no_results' | 'error'
    """
    url = f"{BASE_URL}/{slug}"
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=25_000)
        await asyncio.sleep(PAGE_DELAY)
    except Exception as e:
        return [], None, f"error: {e}"

    total = await get_count(page)

    if dry_run:
        has = await has_results(page)
        return [], total, "ok" if has else "no_results"

    # Check if page actually has company data
    if not await has_results(page):
        return [], total, "no_results"

    all_companies: list[dict] = []
    seen: set[str] = set()
    page_num = 1

    while True:
        await asyncio.sleep(1.0)
        batch = await extract_companies(page)

        for c in batch:
            if c["name"] not in seen:
                seen.add(c["name"])
                all_companies.append(c)
            if limit and len(all_companies) >= limit:
                break

        if limit and len(all_companies) >= limit:
            break
        if page_num >= MAX_PAGES:
            break

        next_btn = await page.query_selector(f"button:text-is('{page_num + 1}')")
        if not next_btn:
            break
        disabled = await next_btn.get_attribute("disabled")
        if disabled is not None:
            break

        await next_btn.scroll_into_view_if_needed()
        await next_btn.click()
        await asyncio.sleep(PAGE_DELAY)
        page_num += 1

    companies = (all_companies[:limit] if limit else all_companies)
    status = "ok" if companies else "empty"
    return companies, total, status


# ── Worker ────────────────────────────────────────────────────────────────────

async def worker(
    worker_id: int,
    queue: asyncio.Queue,
    context: BrowserContext,
    limit: int,
    dry_run: bool,
    counters: dict,
    lock: asyncio.Lock,
):
    page = await context.new_page()

    while True:
        try:
            item = queue.get_nowait()
        except asyncio.QueueEmpty:
            break

        typ, slug = item
        companies, total, status = await scrape_slug(page, slug, limit=limit, dry_run=dry_run)

        async with lock:
            counters["done"] += 1
            done = counters["done"]
            total_slugs = counters["total"]

            if status == "no_results":
                counters["skipped"] += 1
            elif status == "ok":
                counters["found"] += len(companies)
                counters["categories_with_data"] += 1

            pct = done / total_slugs * 100
            count_str = str(total) if total else "?"
            marker = "✓" if status == "ok" else "–"
            print(
                f"  [{done:>5}/{total_slugs}] {pct:5.1f}%  {marker}  "
                f"{slug:<40}  {len(companies)} companies  (site: {count_str})"
            )

        if not dry_run and companies:
            save_per_slug(companies, slug)
            append_master(companies, slug)

        log_progress(slug, status, len(companies), total)
        queue.task_done()

    await page.close()


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(
        description="Scrape ensun.io for ALL FirmsLedger category slugs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--parents-only", action="store_true",
                        help="Only scrape the 93 parent categories (fast)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Check which slugs have results, don't save data")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT,
                        help=f"Companies per category (default: {DEFAULT_LIMIT})")
    parser.add_argument("--concurrency", type=int, default=DEFAULT_CONCURRENCY,
                        help=f"Parallel browser pages (default: {DEFAULT_CONCURRENCY})")
    parser.add_argument("--no-resume", action="store_true",
                        help="Re-scrape all slugs even if already done")
    parser.add_argument("--show-browser", action="store_true",
                        help="Show browser windows")
    args = parser.parse_args()

    # Load slugs
    all_slugs = load_slugs(parents_only=args.parents_only)

    # Resume: skip already-done
    if not args.no_resume:
        done_slugs = load_progress()
        all_slugs = [(t, s) for t, s in all_slugs if s not in done_slugs]
        skipped_resume = len(load_progress())
    else:
        skipped_resume = 0

    # Dedup
    seen_slugs: set[str] = set()
    unique_slugs = []
    for t, s in all_slugs:
        if s not in seen_slugs:
            seen_slugs.add(s)
            unique_slugs.append((t, s))

    total = len(unique_slugs)
    limit = args.limit

    # Estimate time
    seconds_each = PAGE_DELAY + 1.5  # avg per slug (1 page load)
    est_minutes = int(total * seconds_each / args.concurrency / 60)

    print("\n" + "=" * 70)
    print("  Ensun.io FULL Scraper — FirmsLedger")
    print("=" * 70)
    print(f"  Slugs to process  : {total:,}")
    print(f"  Already done      : {skipped_resume:,} (skipped)")
    print(f"  Companies / cat   : {limit if limit else 'unlimited'}")
    print(f"  Concurrency       : {args.concurrency} parallel browsers")
    print(f"  Est. time         : ~{est_minutes} minutes")
    if args.dry_run:
        print("  Mode              : DRY RUN (no CSV saved)")
    print("=" * 70)
    print()

    # Build queue
    queue: asyncio.Queue = asyncio.Queue()
    for item in unique_slugs:
        await queue.put(item)

    counters = {
        "done": 0,
        "total": total,
        "found": 0,
        "skipped": 0,
        "categories_with_data": 0,
    }
    lock = asyncio.Lock()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=not args.show_browser)

        # Create one context per worker
        workers = []
        for i in range(args.concurrency):
            ctx = await browser.new_context(
                user_agent=USER_AGENT,
                locale="en-US",
                viewport={"width": 1280, "height": 900},
            )
            workers.append(worker(i, queue, ctx, limit, args.dry_run, counters, lock))

        await asyncio.gather(*workers)
        await browser.close()

    # Summary
    print()
    print("=" * 70)
    print("  DONE")
    print("=" * 70)
    print(f"  Slugs processed         : {counters['done']:,}")
    print(f"  Categories with results : {counters['categories_with_data']:,}")
    print(f"  No results (skipped)    : {counters['skipped']:,}")
    if not args.dry_run:
        print(f"  Total companies saved   : {counters['found']:,}")
        print(f"  Master CSV              : {MASTER_CSV}")
        print(f"  Per-category CSVs       : {OUTPUT_DIR}/")
    print(f"  Progress log            : {PROGRESS_CSV}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
