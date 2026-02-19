/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './views/AdminDashboard';
import AgencyDashboard from './views/AgencyDashboard';
import AgencyProfile from './views/AgencyProfile';
import BlogPost from './views/BlogPost';
import Blogs from './views/Blog';
import Categories from './views/Categories';
import CategoryPage from './views/CategoryPage';
import Compare from './views/Compare';
import CountryPage from './views/CountryPage';
import Directory from './views/Directory';
import Home from './views/Home';
import RequestProposal from './views/RequestProposal';
import __Layout from './Layout.jsx';

function TopRankingsPlaceholder() {
  return null;
}
function WriteReviewPlaceholder() {
  return null;
}

export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AgencyDashboard": AgencyDashboard,
    "AgencyProfile": AgencyProfile,
    "BlogPost": BlogPost,
    "Blogs": Blogs,
    "Categories": Categories,
    "CategoryPage": CategoryPage,
    "Compare": Compare,
    "CountryPage": CountryPage,
    "Directory": Directory,
    "Home": Home,
    "RequestProposal": RequestProposal,
    "TopRankings": TopRankingsPlaceholder,
    "WriteReview": WriteReviewPlaceholder,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};