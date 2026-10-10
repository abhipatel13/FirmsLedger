const JUNK_DESCRIPTION_MARKERS = [
  'incident id', 'access denied', 'enable javascript', 'requires javascript', 'turn on javascript',
  'javascript is disabled', 'checking your browser', 'request unsuccessful', 'incapsula', 'cloudflare',
  'please enable js', 'security check', 'error 403', 'forbidden', 'captcha',
  'we use cookies', 'use of cookies', 'accept all cookies', 'cookie policy', 'cookies to ', 'this website uses cookies', 'cookie settings',
  'page not found', '404 means', 'file is not found', 'perfect domain name', 'domain is for sale', 'this domain',
  'all rights reserved', 'left/right arrows', 'has multiple variants', 'for validation purposes',
  'javascript enabled', 'javascript feature', 'mengaktifkan javascript', 'your browser', 'supported browser',
  'different browser', 'browsing in ie', 'displaying frames', 'site owner', 'at checkout', 'add to cart',
  'cart error', 'saved orders', 'subscribe to our', 'unsubscribe', 'mailing list', 'consent to receive',
  'discount code', 'copyright ©', '© 20', '© copyright', 'site uses cookies', 'cookies are essential',
  'cookies used on our website', 'javascript is enabled', 'javascript ist', 'manage it in your', 'domain registrar',
  'established domain ready', 'registration has expired', 'your cart', 'in your cart', 'shopping cart', 'reflects in cart',
  'log in or register', 'login to your account', 'checkout process', 'checkout separately', 'subscribe for the latest',
  'subscribing to your newsletter', 'best newsletter', 'enter your email', 'font awesome', 'flash content',
  "couldn’t load", 'store hours:',
];

const MOJIBAKE = /ï¿½|[ãå][\u0080-\u00bf]/;

/** Validate description content, filtering out scraper blocks, JavaScript requirements, or tag lists. */
export function isProperDescription(desc) {
  if (!desc) return false;
  const normalized = desc.toLowerCase().trim();
  if (MOJIBAKE.test(normalized) || JUNK_DESCRIPTION_MARKERS.some((m) => normalized.includes(m))) {
    return false;
  }
  
  // If it has multiple pipe characters (e.g. >= 2), it's probably just a tag list and not a proper sentence
  const pipeCount = (desc.match(/\|/g) || []).length;
  if (pipeCount >= 2) {
    return false;
  }

  // If it's too short (e.g. less than 15 characters), it might not be a real description
  if (desc.trim().length < 15) {
    return false;
  }

  return true;
}
