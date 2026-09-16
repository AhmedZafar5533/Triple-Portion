import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Footer from "../components/Footer";

export default function OTPVerification() {
    const { verifyOtp, loading, redirectToOtp, getOtp, newOtp } = useAuthStore();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [nOtp, setNewOtp] = useState(null);
    const navigate = useNavigate();

    const RESEND_COOLDOWN = 30;
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (!loading && !redirectToOtp) {
            navigate("/");
        }
    }, [redirectToOtp, loading, navigate]);

    useEffect(() => {
        if (redirectToOtp) {
            getOtp();
            setResendTimer(RESEND_COOLDOWN);
        }
    }, [redirectToOtp, getOtp]);

    useEffect(() => {
        if (newOtp) {
            setNewOtp(newOtp);
        }
    }, [newOtp]);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const timeoutId = setTimeout(() => {
            setResendTimer(resendTimer - 1);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [resendTimer]);

    const handleChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtpArray = [...otp];
        newOtpArray[index] = value;
        setOtp(newOtpArray);
        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = () => {
        const joinedOtp = otp.join("");
        verifyOtp(joinedOtp);
    };

    const handleResendOtp = () => {
        if (resendTimer > 0) return;
        getOtp();
        setResendTimer(RESEND_COOLDOWN);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50/50 to-pink-50/30 flex flex-col">
            <header className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <a
                        href="/"
                        aria-label="Go to homepage"
                        className="flex items-center space-x-3 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 group w-fit"
                    >
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 shadow-lg flex items-center justify-center transition-transform transform group-hover:scale-110">
                            <span className="text-white font-bold text-xl sm:text-2xl">T</span>
                            <span className="absolute inset-0 rounded-full ring-2 ring-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 transition-colors group-hover:text-rose-600">
                            Triple Portion
                        </span>
                    </a>
                </div>
            </header>

            <div className="flex-grow flex justify-center items-center p-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl border border-rose-100 p-6 sm:p-8 md:p-10 w-full max-w-md">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">
                        Enter OTP
                    </h2>
                    <p className="text-gray-600 text-center mb-4">
                        We've sent a code to your email
                    </p>

                    <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg sm:text-2xl font-semibold rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-rose-600 to-pink-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg hover:from-rose-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.01] shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </button>

                    <p className="text-gray-600 text-center mt-6 text-xs sm:text-sm">
                        Didn't receive the code?{' '}
                        {resendTimer > 0 ? (
                            <span className="text-rose-600 font-medium">
                                Resend OTP in {resendTimer} seconds
                            </span>
                        ) : (
                            <button
                                onClick={handleResendOtp}
                                className="text-rose-600 font-medium hover:text-rose-800 hover:underline"
                            >
                                Resend OTP
                            </button>
                        )}
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
