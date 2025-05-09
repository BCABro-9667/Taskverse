import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back!">
      <p className="mb-6 text-center text-muted-foreground">
        Log in to manage your tasks.
      </p>
      <LoginForm />
    </AuthLayout>
  );
}