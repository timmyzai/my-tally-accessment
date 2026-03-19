import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Assessment Portal",
  description: "Tally Assessment Platform",
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${outfit.variable} ${plusJakarta.variable} relative min-h-screen text-gray-100 overflow-hidden`}
      style={{
        fontFamily: "var(--font-plus-jakarta), sans-serif",
        background: "linear-gradient(180deg, #06060a 0%, #0c0e18 50%, #06060a 100%)",
      }}
    >
      {/* Subtle animated grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-[30%] -right-[15%] h-[60vh] w-[60vh] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
