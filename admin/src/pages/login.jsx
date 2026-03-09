import React from 'react';
import LoginForm from '../components/loginform';
import Footer from '../components/footer';
function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <LoginForm />
      </div>
      <Footer />
    </div>
  );
}

export default Login;