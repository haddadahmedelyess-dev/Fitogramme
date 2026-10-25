'use client';

import { Suspense } from 'react';
import AuthForm from './AuthForm';
import { PageLoading } from '@/components/ui';

export default function AuthPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuthForm />
    </Suspense>
  );
}
