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

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

const signupSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

type AuthFormProps = { variant?: 'login' | 'signup' }

export default function AuthForm({ variant }: AuthFormProps) {
  const isSignup = variant === 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login')
  const router = useRouter()

  const schema = mode === 'login' ? loginSchema : signupSchema
  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'login'
        ? { email: '', password: '' }
        : { username: '', email: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, values.email, values.password)
        toast.success('Welcome back!')
      } else {
        const cred = await createUserWithEmailAndPassword(auth, values.email, values.password)
        await updateProfile(cred.user, { displayName: (values as any).username })
        toast.success('Account created!')
      }
      router.push('/chat')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    form.reset()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-400">
      <div className="w-full max-w-5xl h-[600px] bg-white rounded-xl overflow-hidden shadow-xl flex">
        {/* Left Side - Welcome Text */}
        <div className="w-1/2 h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-10 text-white flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to website</h1>
          <p className="text-base leading-relaxed opacity-90">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh
            euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-1/2 h-full p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {mode === 'login' ? 'User Login' : 'Create Account'}
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {mode === 'signup' && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="yourusername"
                          className="bg-gray-100 border border-gray-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-gray-100 border border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-gray-100 border border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Remember + Forgot */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-pink-500" />
                  <span>Remember</span>
                </label>
                <button type="button" className="hover:underline">Forgot password?</button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:brightness-110 text-white font-semibold py-2 rounded-full"
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="text-pink-600 hover:underline ml-1"
            >
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
