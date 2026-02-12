import { Target, Trophy, Zap } from 'lucide-react'
import { StepCard } from '../StepCard'

function HowistWork() {
    return (
        <section className="py-24 px-4 md:px-6 w-full flex flex-col items-center bg-zinc-950/30 backdrop-blur-sm border-y border-white/5">
            <div className="max-w-6xl mx-auto w-full text-center">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-20 uppercase">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                    <StepCard
                        step="Step 01"
                        title="Real-Time Battle"
                        description="Every move renders instantly. No turns, just pure speed and strategy. Dominate the grid in high-fidelity."
                        footerLabel="Battle Arena"
                        footerValue="0xARENA_01"
                        icon={<Zap className="h-4 w-4" />}
                        image="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80"
                    />
                    <StepCard
                        step="Step 02"
                        title="Claim Tiles"
                        description="Expand your territory tile by tile. Block opponents and secure your zone with lightning fast reflexes."
                        footerLabel="Territory"
                        footerValue="0xCLAIM_99"
                        icon={<Target className="h-4 w-4" />}
                        image="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80"
                    />
                    <StepCard
                        step="Step 03"
                        title="Compete Control"
                        description="Dominate the leaderboard by owning the most territory when time runs out. The ultimate control challenge."
                        footerLabel="Leaderboard"
                        footerValue="0xWINNER_X"
                        icon={<Trophy className="h-4 w-4" />}
                        image="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
                    />
                </div>
            </div>
        </section>
    )
}

export default HowistWork
