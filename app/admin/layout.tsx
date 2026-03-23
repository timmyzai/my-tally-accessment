export const metadata = {
  title: "Admin Dashboard",
  description: "Tally Assessment Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen text-gray-100"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "linear-gradient(145deg, #06060a 0%, #0c0e18 50%, #080a14 100%)",
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[60vw] rounded-full bg-violet-900/[0.07] blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] h-[70vh] w-[50vw] rounded-full bg-cyan-900/[0.05] blur-[120px]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
