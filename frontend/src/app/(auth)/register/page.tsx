import { AuthBackground } from '../../../features/auth/components/AuthBackground';
import { RegisterForm } from '../../../features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthBackground>
      <RegisterForm />
    </AuthBackground>
  );
}
