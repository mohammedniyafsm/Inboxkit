import { CardsSlider } from '../CardsSlider'

function CaptureCard() {
    return (
        <div>
            <section className="py-24 px-4 w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-4 uppercase">Captured Cards</h2>
                    <p className="text-sm text-gray-500 max-w-2xl mx-auto uppercase tracking-widest font-medium">
                        Instant Synchronization // Zero Delay // Global Arena
                    </p>
                </div>

                <CardsSlider />
            </section>
        </div>
    )
}

export default CaptureCard
