import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  X,
  Check,
  ArrowRight,
  ShoppingBag,
  Store,
  ChevronLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });

  const navigate = useNavigate();

  const {
    sendRegisterRequest,
    loading,
    authenticationState,
  } = useAuthStore();

  useEffect(() => {
    document.title = "Sign Up | Triple Portion";
    if (authenticationState) {
      navigate("/");
    }
  }, [authenticationState, navigate]);

  useEffect(() => {
    const { password } = formData;
    setPasswordValidation({
      minLength: password.length >= 6,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
    });
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const usernameRegex = /^[a-zA-Z0-9\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!formData.username.trim() || !usernameRegex.test(formData.username)) {
      toast.error("Enter a valid username.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email address.");
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 6 characters with a letter and a number.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (formData.role === "admin" || !["buyer", "seller"].includes(formData.role)) {
      toast.error("Invalid role selected.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    sendRegisterRequest(formData);
  };

  const PasswordChecklist = () => {
    const requirements = [
      {
        key: "minLength",
        text: "At least 6 characters",
        met: passwordValidation.minLength,
      },
      {
        key: "hasLetter",
        text: "Contains a letter",
        met: passwordValidation.hasLetter,
      },
      {
        key: "hasNumber",
        text: "Contains a number",
        met: passwordValidation.hasNumber,
      },
    ];

    return (
      <div className="mt-2 space-y-1 text-sm">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center">
            {req.met ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-red-500 mr-2" />
            )}
            <span className={req.met ? "text-green-600" : "text-red-500"}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 to-pink-50/30 flex flex-col relative">
      {/* Logo Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          aria-label="Go to homepage"
          className="flex items-center space-x-2 p-1 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-full group"
        >
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 shadow-lg flex items-center justify-center transition-transform transform group-hover:scale-110">
            <span className="text-white font-bold text-xl sm:text-2xl">T</span>
            <span className="absolute inset-0 rounded-full ring-2 ring-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 transition-colors group-hover:text-rose-600 hidden sm:block">
            Triple Portion
          </span>
        </Link>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md w-full">
          {/* Signup Card */}
          <div className="bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-white/20 rounded-[2rem] p-8 md:p-10 w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 rounded-full bg-rose-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-32 h-32 rounded-full bg-pink-500/10 blur-3xl"></div>
            
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Create an account
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                {step === 1 ? "Select how you'll use our platform" : "Fill in your details to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, role: "buyer" }));
                        setStep(2);
                      }}
                      className="relative p-6 border-2 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border-gray-100 bg-gray-50/50 hover:border-rose-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(225,29,72,0.12)] hover:-translate-y-1 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <ShoppingBag className="w-7 h-7 text-gray-400 group-hover:text-rose-500 transition-colors" />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">I'm a Buyer</span>
                      <span className="text-sm text-gray-500 mt-1.5 leading-relaxed">Discover and purchase amazing products.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, role: "seller" }));
                        setStep(2);
                      }}
                      className="relative p-6 border-2 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border-gray-100 bg-gray-50/50 hover:border-rose-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(225,29,72,0.12)] hover:-translate-y-1 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Store className="w-7 h-7 text-gray-400 group-hover:text-rose-500 transition-colors" />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">I'm a Seller</span>
                      <span className="text-sm text-gray-500 mt-1.5 leading-relaxed">Set up shop and sell your products.</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center -mt-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-500 hover:text-rose-600 flex items-center transition-colors font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Change Role ({formData.role === "buyer" ? "Buyer" : "Seller"})
                    </button>
                  </div>

                  {/* Username Input */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white shadow-sm placeholder:text-gray-400"
                      placeholder="Choose a username"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white shadow-sm placeholder:text-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1"
                    >
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white shadow-sm placeholder:text-gray-400"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Validation Checklist */}
                    {formData.password.length > 0 && <PasswordChecklist />}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white shadow-sm placeholder:text-gray-400"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Signup Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer flex justify-center items-center px-4 py-3.5 border border-transparent rounded-xl shadow-[0_8px_20px_rgb(225,29,72,0.25)] text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 hover:shadow-[0_8px_25px_rgb(225,29,72,0.35)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Login prompt */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-rose-600 hover:text-rose-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
