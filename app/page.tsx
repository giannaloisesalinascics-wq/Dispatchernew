import AuthCard from "../components/AuthCard";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Main Background Image */}
      <img
        src="/bg-auth.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Optional orange tint */}
      <div className="absolute inset-0 bg-[#F2552C]/25"></div>

      {/* Page Content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">

        <div className="mb-7 text-center">
          <h1 className="text-[72px] font-light tracking-[0.22em] text-white leading-none">
            WELCOME
          </h1>

          <p className="mt-2 text-[26px] text-white/95">
            Dispatcher
          </p>
        </div>

        <AuthCard />

      </section>

    </main>
  );
}