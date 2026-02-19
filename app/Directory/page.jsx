import { Suspense } from 'react';
import Directory from '@/views/Directory';

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <Directory />
    </Suspense>
  );
}
