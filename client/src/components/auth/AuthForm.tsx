'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import toast from 'react-hot-toast'

// Define separate schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

const signupSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

// Infer types
type LoginFormValues = z.infer<typeof loginSchema>
type SignupFormValues = z.infer<typeof signupSchema>
type FormValues = LoginFormValues | SignupFormValues

type AuthFormProps = { variant?: 'login' | 'signup' }

export default function AuthForm({ variant }: AuthFormProps) {
  const isSignup = variant === 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login')
  const router = useRouter()

  const defaultValues: FormValues =
  mode === 'login'
    ? { email: '', password: '' }
    : { username: '', email: '', password: '' }

  const schema = mode === 'login' ? loginSchema : signupSchema

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })


  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, values.email, values.password)
        toast.success('Welcome back!')
      } else {
        const cred = await createUserWithEmailAndPassword(auth, values.email, values.password)
        if ('username' in values) {
          await updateProfile(cred.user, { displayName: values.username })
        }
        toast.success('Account created!')
      }
      router.push('/chat')
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message)
      } else {
        console.error('Unknown error during auth')
      }
    }
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    form.reset()
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-xl bg-[#0d0d0d] border border-white/10">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {mode === 'signup' && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourusername"
                      className="bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl"
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-gray-400">
        {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
        <button
          onClick={toggleMode}
          className="text-gray-300 hover:underline ml-1"
        >
          {mode === 'login' ? 'Create an account' : 'Sign in instead'}
        </button>
      </div>
    </div>
  )
}
