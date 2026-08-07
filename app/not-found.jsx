import PageNotFound from '@/lib/PageNotFound';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <PageNotFound />;
}
