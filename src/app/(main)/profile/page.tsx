"use client";

import React, { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { User } from '@/generated/prisma/client';
import Unauthorized from '@/components/unauthorized';

const Page = () => {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const userId = session?.user?.id as User['id'];
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!userId) {
          setUnauthorized(true);
          setIsLoading(false);
          return;
        }
        const res = await fetch(`/api/users/${userId}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          return notFound();
        }
        const data: User = await res.json();
        if (!data) {
          return notFound();
        }
        setUser(data);
        router.push(`/profile/${userId}`);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);


  return (
    <div className="min-h-screen flex items-center justify-center">
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {unauthorized && <Unauthorized />}
      {!isLoading && !error && !unauthorized && user && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Redirecting to your profile...</h1>
        </div>
      )}
    </div>
  );
};

export default Page;