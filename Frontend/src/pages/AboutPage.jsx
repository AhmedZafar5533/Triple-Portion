import React, { useEffect } from "react";
import { ArrowRight, ShieldCheck, TrendingUp, Users, Target, Heart } from "lucide-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <div className="bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-amber-50/30 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                    Redefining Quality with
                    <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent block mt-2">
                        Triple Portion
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
                    We're on a mission to bring you premium products that combine exceptional quality with unmatched affordability. Your satisfaction is our standard.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/">
                        <button className="bg-gradient-to-r from-rose-600 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-rose-200 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                            <span>Start Shopping</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const AboutSection = () => {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                            alt="Our Team"
                            className="rounded-2xl shadow-xl w-full h-auto object-cover"
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 font-semibold rounded-full text-sm">
                            Our Story
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Built on Trust and Innovation
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Founded with a simple idea: to make high-quality products accessible to everyone. We believe that you shouldn't have to choose between affordability and excellence.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Today, Triple Portion serves thousands of customers worldwide, partnering with top manufacturers to ensure every item meets our strict quality standards before it reaches your door.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ValuesSection = () => {
    const values = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-rose-600" />,
            title: "Quality First",
            description: "Every product is rigorously tested to meet global quality benchmarks."
        },
        {
            icon: <Users className="w-8 h-8 text-rose-600" />,
            title: "Customer Centric",
            description: "Your experience drives our innovation and service improvements."
        },
        {
            icon: <Heart className="w-8 h-8 text-rose-500" />,
            title: "Passion Driven",
            description: "We love what we do, and it reflects in the products we curate."
        },
        {
            icon: <Target className="w-8 h-8 text-emerald-600" />,
            title: "Targeted Excellence",
            description: "Focused on delivering exactly what you need, when you need it."
        }
    ];

    return (
        <div className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
                    <p className="text-xl text-slate-600">The principles that guide everything we do.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="mb-4">{value.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CtaSection = () => {
    return (
        <div className="bg-gradient-to-r from-rose-600 to-pink-500 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Ready to experience the difference?
                </h2>
                <p className="text-rose-100 text-lg">
                    Join thousands of satisfied customers who have already discovered the Triple Portion standard.
                </p>
                <Link to="/">
                    <button className="bg-white text-rose-600 px-8 py-4 rounded-full font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 mt-4">
                        Explore Our Collection
                    </button>
                </Link>
            </div>
        </div>
    );
};

const AboutPage = () => {
    useEffect(() => {
        document.title = "About Us | Triple Portion";
    }, []);
    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <AboutSection />
            <ValuesSection />
            <CtaSection />
            <Footer />
        </div>
    );
};

export default AboutPage;
