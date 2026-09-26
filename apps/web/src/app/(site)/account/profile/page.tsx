'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/auth-store';
import { updateProfile } from '../../../../lib/orders';
import { api, uploadFile, ApiError } from '../../../../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login?redirect=/account/profile');
      return;
    }
    // Syncing local editable copy from an async-loaded external
    // value on first load — a legitimate effect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(user.firstName);
    setLastName(user.lastName);
  }, [isInitialized, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const updated = await updateProfile({ firstName, lastName }, accessToken);
      useAuthStore.setState({ user: updated as typeof user });
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? err.message : 'Could not update profile');
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const updated = await uploadFile<typeof user>('/auth/profile/avatar', file, accessToken);
      useAuthStore.setState({ user: updated });
    } catch {
      setError('Could not upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarUploading(true);
    try {
      const updated = await api.delete<typeof user>('/auth/profile/avatar', accessToken);
      useAuthStore.setState({ user: updated });
    } finally {
      setAvatarUploading(false);
    }
  }

  if (!user) {
    return <div className="mx-auto max-w-xl px-6 py-24 text-center text-ink/50">Loading...</div>;
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-light text-ink">My Profile</h1>

      <div className="mt-8 flex items-center gap-4">
        <div className="group relative h-16 w-16 shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-lg font-semibold text-forest-dark">
              {initials}
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
          >
            {avatarUploading ? '...' : 'Edit'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <p className="font-medium text-ink">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-ink/50">{user.email}</p>
          {user.avatarUrl && (
            <button
              type="button"
              onClick={handleAvatarRemove}
              disabled={avatarUploading}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/40">
            First name
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/40">
            Last name
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/40">
            Email
          </label>
          <input
            value={user.email}
            disabled
            className="w-full rounded-lg border border-line bg-[#f2f5f1] px-4 py-3 text-sm text-ink/50"
          />
          <p className="mt-1.5 text-xs text-ink/40">
            Email changes aren&apos;t supported yet — contact support if you need this updated.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {status === 'saved' && <p className="text-sm text-forest-dark">Profile updated.</p>}

        <button
          type="submit"
          disabled={status === 'saving'}
          className="mt-2 rounded-full bg-ink py-3 text-sm font-medium text-white hover:bg-forest-dark disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}