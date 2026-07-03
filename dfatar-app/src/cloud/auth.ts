import { supabase } from './supabase';

export interface CloudUser {
  id: string;
  email: string | null;
}

export async function getCloudUser(): Promise<CloudUser | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  return user ? { id: user.id, email: user.email ?? null } : null;
}

export interface SignUpResult {
  error: string | null;
  needsEmailConfirmation: boolean;
  userId: string | null;
}

export async function signUpCloud(email: string, password: string): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) return { error: error.message, needsEmailConfirmation: false, userId: null };
  return {
    error: null,
    needsEmailConfirmation: !data.session,
    userId: data.user?.id ?? null,
  };
}

export interface SignInResult {
  error: string | null;
  userId: string | null;
}

export async function signInCloud(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { error: error.message, userId: null };
  return { error: null, userId: data.user?.id ?? null };
}

export async function signOutCloud(): Promise<void> {
  await supabase.auth.signOut();
}
