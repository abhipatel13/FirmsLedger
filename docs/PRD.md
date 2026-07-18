# FirmsLedger Product Requirements Document (PRD)

**Version:** MVP v1.0  
**Status:** In Development  
**Product:** FirmsLedger  
**Owner:** Abhi Patel

---

# 1. Product Vision

FirmsLedger is a **U.S. manufacturing directory** that helps businesses connect with verified manufacturers, suppliers, and industrial companies across all 50 states.

The platform enables buyers to quickly discover trusted manufacturing partners while giving manufacturers a professional online presence that generates qualified leads.

The initial release focuses exclusively on the United States. International expansion is outside the scope of the MVP.

---

# 2. Product Goals

## Primary Goals

- Build the best manufacturing directory in the United States.
- Help buyers quickly find trusted manufacturers.
- Help manufacturers generate qualified leads.
- Build SEO-first category and state landing pages.
- Create a scalable platform that can grow into the leading manufacturing marketplace.

---

# 3. Target Audience

## Buyers

- Procurement Managers
- Purchasing Departments
- Engineers
- Product Designers
- OEMs
- Startups
- Industrial Companies

Typical searches include:

- Manufacturers
- Suppliers
- OEM Partners
- Fabricators
- Contract Manufacturers

---

## Manufacturers

Manufacturers looking to:

- Generate leads
- Improve SEO
- Increase online visibility
- Receive qualified inquiries
- Build credibility

---

# 4. Geographic Scope

## MVP Launch

United States only.

The platform will support companies across all 50 U.S. states.

The application must NOT reference:

- Global
- Worldwide
- Countries Covered
- International Directory

Instead use:

- United States
- U.S.
- Across all 50 states
- Nationwide

---

# 5. MVP Features

The first release includes:

- Homepage
- Browse Categories
- Browse States
- Company Directory
- Company Profile Pages
- Search
- Company Submission
- SEO Landing Pages
- Responsive Design

The following features are NOT included in the MVP:

- Premium Listings
- Membership Plans
- Payments
- Reviews
- Messaging
- RFQ Marketplace
- User Accounts
- Saved Companies
- Analytics Dashboard
- AI Recommendations

These will be considered in future releases.

---

# 6. Manufacturing Categories

The MVP contains the following manufacturing categories:

- Automotive Parts
- Mechanical Manufacturers
- Electrical Equipment Manufacturing
- Electronics & Semiconductor
- Metal Fabrication
- Plastics & Packaging
- Furniture & Woodworking
- Medical Devices
- Textile & Apparel
- Food & Beverage

Bike Manufacturers has been removed because it belongs under the Automotive industry and should not exist as its own top-level category.

---

# 7. Navigation

The navigation bar must remain simple.

## Navbar Items

- Logo
- Browse
- Contact
- Search Icon
- List Your Company

The following have been removed:

- Category Dropdown
- State Dropdown

Navigation should remain clean with balanced spacing after removal.

---

# 8. Browse Menu

The Browse menu contains two tabs:

## By Category

Displays every manufacturing category.

## By State

Displays all U.S. states.

Users can browse by either category or state.

---

# 9. Homepage

Homepage sections:

1. Hero
2. Browse Categories
3. Featured Categories
4. Featured Companies
5. How It Works
6. Call To Action
7. Footer

Homepage messaging should consistently describe FirmsLedger as a U.S. manufacturing directory.

---

# 10. Homepage Copy

Hero description:

> FirmsLedger is a U.S. manufacturing directory that helps businesses connect with verified manufacturers, suppliers, and industrial companies across all 50 states. Submit your listing today and start reaching qualified buyers.

Do not reference global coverage anywhere.

---

# 11. Browse Flow

Correct navigation flow:

Homepage

↓

Browse

↓

Manufacturing Category

↓

Category Landing Page

↓

Choose State

↓

Company Listings

↓

Company Profile

Users should never be redirected directly into California.

---

# 12. Routing

Homepage

/

Category

/category/[category]

Example

/category/electrical-equipment-manufacturing

State Listings

/category/[category]/[state]

Example

/category/electrical-equipment-manufacturing/texas

Company

/company/[slug]

Example

/company/abc-industries

No route should automatically default to California.

---

# 13. Category Pages

Each category page contains:

- Hero Section
- Category Description
- Number of Companies
- Available States
- Featured Companies
- CTA

If a category contains no companies, display:

> No companies have been added to this category yet. Check back soon or list your company.

Never redirect.

Never show 404.

Never redirect users into another category.

---

# 14. State Pages

Each state page displays:

- Hero
- Company Listings
- Sorting
- Related Categories
- SEO Content

Example:

Electrical Equipment Manufacturing

↓

Texas

Displays only manufacturers located in Texas.

---

# 15. Company Listings

Each listing card displays:

- Company Logo
- Company Name
- Verification Badge
- Category
- Location
- Short Description
- View Profile Button

Future enhancements:

- Reviews
- Ratings
- Response Time

---

# 16. Company Profile

Each company profile contains:

- Logo
- Hero Banner
- Company Description
- Products
- Capabilities
- Industries Served
- Gallery
- Website
- Contact Information
- State
- Related Companies

---

# 17. Search

Users should be able to search by:

- Company Name
- Manufacturing Category
- Keyword
- State

Search should never require selecting a state first.

---

# 18. Company Submission

Submission Flow

Landing Page

↓

Business Details

↓

Review

↓

Approval

↓

Published

---

## Company Submission Hero Copy

Headline:

Get your business in front of buyers

Description:

> FirmsLedger is a U.S. manufacturing directory that helps businesses connect with verified manufacturers, suppliers, and industrial companies across all 50 states. Submit your listing today and start reaching qualified buyers.

Statistics:

30+

Verified Companies

50

U.S. States Covered

15+

Manufacturing Categories

Remove all references to:

- Global
- Countries Covered

---

# 19. Design Principles

The UI should feel:

- Clean
- Modern
- Industrial
- Premium
- Professional
- Minimal

Avoid unnecessary clutter.

Whitespace should be used generously.

Maintain consistent spacing throughout the application.

---

# 20. Brand Voice

Professional.

Trustworthy.

Industrial.

Simple.

Clear.

Avoid marketing buzzwords.

---

# 21. SEO Strategy

Every page should include:

- Unique Title
- Meta Description
- Open Graph Tags
- Canonical URL
- Structured Data
- Indexable URLs

Example Titles:

Top Metal Fabrication Companies in Texas

Best Electronics Manufacturers in California

Medical Device Manufacturers in Florida

Category and state pages should be optimized for organic search.

---

# 22. Empty States

If a category or state has no listings:

Display:

"No companies have been added to this category yet.

Check back soon or list your company."

Do not redirect.

Do not display errors.

Do not show broken pages.

---

# 23. Current Decisions

The following decisions have been finalized:

## USA Only

The MVP launches only in the United States.

No international support.

---

## Bike Manufacturers Removed

Bike Manufacturers has been removed because it belongs within the Automotive industry.

---

## Electrical Manufacturers Renamed

The category "Electrical Manufacturers" is incorrect.

It has been renamed to:

Electrical Equipment Manufacturing

Update this everywhere:

- Homepage
- Browse Menu
- URLs
- Database
- SEO
- Breadcrumbs
- Landing Pages

---

## California Default Removed

Users should NEVER be redirected to California by default.

Correct flow:

Browse

↓

Category

↓

Category Page

↓

Choose State

↓

State Listings

California should only appear if the user explicitly selects California or navigates to a California URL.

---

## Empty Categories

Only the Electrical Equipment Manufacturing category currently contains company data.

All remaining categories should remain accessible even when empty.

Display an empty state rather than redirecting or showing an error.

Additional company data will be added later.

---

## Navbar Simplification

Remove:

- Category Dropdown
- State Dropdown

Final Navbar:

Logo

Browse

Contact

Search

List Your Company

---

# 24. Future Roadmap

Future releases may include:

- Premium Listings
- Featured Companies
- Reviews
- Ratings
- Messaging
- RFQ Marketplace
- AI Company Recommendations
- User Accounts
- Saved Companies
- Analytics Dashboard
- Admin Panel
- International Expansion

These features are NOT part of MVP.

---

# 25. Success Metrics

The MVP is considered successful when:

- Users can discover manufacturers within three clicks.
- Every category page is accessible.
- No broken routes exist.
- No hardcoded California redirects remain.
- Navigation is intuitive.
- SEO-friendly URLs are implemented.
- Responsive on desktop, tablet, and mobile.
- Consistent U.S.-focused messaging across the platform.
- The codebase is scalable for future expansion.

---

# 26. Development Principles

Developers should follow these principles:

- Keep components reusable.
- Avoid hardcoded values.
- Follow SEO best practices.
- Maintain consistent naming conventions.
- Keep routing RESTful and predictable.
- Prefer configuration over hardcoded logic.
- Ensure every page has proper loading and empty states.
- Write maintainable, scalable code.
- Preserve accessibility standards.
- Prioritize performance and clean UI.

---

# 27. Definition of Done

A feature is considered complete only when:

- Functional requirements are implemented.
- UI matches the design.
- Responsive on desktop, tablet, and mobile.
- No console errors.
- No TypeScript errors.
- No broken links.
- SEO metadata is included.
- Empty states are handled.
- Accessibility checks pass.
- Code has been reviewed and follows project standards.