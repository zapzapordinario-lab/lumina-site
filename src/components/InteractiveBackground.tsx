import { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.setProperty("--mx", `${e.clientX}px`);
          ref.current.style.setProperty("--my", `${e.clientY}px`);
        }
      });
    };
    window.addEventListener("mousemove", handle);
    return () => {
      window.removeEventListener("mousemove", handle);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 grid-bg" />
      <div
        ref={ref}
        className="absolute inset-0 transition-opacity"
        style={{
          background:
            "radial-gradient(550px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, var(--cyan) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--magenta) 35%, transparent), transparent 70%)" }}
      />
    </div>
  );
}
