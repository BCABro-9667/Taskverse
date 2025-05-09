import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout title="Create an Account">
      <p className="mb-6 text-center text-muted-foreground">
        Join TaskMaster today!
      </p>
      <RegisterForm />
    </AuthLayout>
  );
}