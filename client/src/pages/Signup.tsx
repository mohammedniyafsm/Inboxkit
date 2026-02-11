import { GlassAuthCard } from "@/components/GlassAuthCard";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async (data: any) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Signup failed");
            }

            login(result.data.token, result.data.user);
            navigate("/arena");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">

            <div className="z-10 w-full max-w-md px-4">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}
                <GlassAuthCard mode="signup" onSubmit={handleSignup} isLoading={isLoading} />
            </div>
        </div>
    );
}
