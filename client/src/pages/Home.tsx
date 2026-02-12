import { HeroBlock } from "@/components/uitripled/hero-block-shadcnui";
import { FooterBlock } from "@/components/FooterBlock";
import HowistWork from "@/components/Sections/HowistWork";
import CaptureCard from "@/components/Sections/CaptureCard";

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center w-full">
            <div className="w-full max-w-[1400px] flex flex-col items-center">
                <HeroBlock />

                {/* How It Works Section */}
                 <HowistWork/>

                {/* Captured Assets Section */}
                <CaptureCard/>

                <FooterBlock />
            </div>
        </main>
    );
}


