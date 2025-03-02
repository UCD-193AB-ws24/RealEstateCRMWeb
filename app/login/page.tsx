"use client";

import AuthButton from "@/components/auth/AuthButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d8b4fe] via-[#a78bfa] to-[#818cf8] dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-8">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-semibold text-gray-900 dark:text-white">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-6">
            Sign in to access your account
          </p>
          <AuthButton />
        </CardContent>
      </Card>
    </div>
  );
}
