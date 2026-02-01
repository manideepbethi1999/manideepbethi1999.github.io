import { useState, useEffect, useRef } from "react";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const AUDIO_URL = "/sleep.mp3";

  // Handle Audio Playback on Interation (including Scroll)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4;

    const startPlayback = async () => {
      if (!hasUserInteracted && !isPlaying) {
        try {
          await audio.play();
          setHasUserInteracted(true);
          cleanup();
        } catch (err) {
          console.log(err);
          
        }
      }
    };

    const cleanup = () => {
      window.removeEventListener('scroll', startPlayback);
      window.removeEventListener('wheel', startPlayback);
      window.removeEventListener('touchmove', startPlayback);
      window.removeEventListener('click', startPlayback);
      window.removeEventListener('touchstart', startPlayback);
      window.removeEventListener('keydown', startPlayback);
    };

    // Add listeners for all common user gestures
    window.addEventListener('scroll', startPlayback, { passive: true });
    window.addEventListener('wheel', startPlayback, { passive: true });
    window.addEventListener('touchmove', startPlayback, { passive: true });
    window.addEventListener('click', startPlayback);
    window.addEventListener('touchstart', startPlayback);
    window.addEventListener('keydown', startPlayback);

    // Initial check (some browsers allow autoplay)
    startPlayback();

    return cleanup;
  }, [hasUserInteracted, isPlaying]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    setHasUserInteracted(true); // Mark that user has interacted
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Playback failed:", err);
        // If it's a permission error, we might need to unmute first
        if (err.name === 'NotAllowedError') {
          // Some browsers require unmuting first
          audioRef.current!.muted = false;
          audioRef.current!.play().catch(console.error);
        }
      });
    }
  };

  // Enhanced audio error handling
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.currentTarget;
    console.error("Audio Error:", {
      errorCode: target.error?.code,
      message: target.error?.message,
      src: target.src,
      networkState: target.networkState
    });
    setIsPlaying(false);
  };

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm"
            : "bg-transparent"
        }`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Audio Container */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <a
                href="#"
                className="group flex items-center gap-2 font-display font-bold tracking-tight text-foreground hover:text-primary transition-colors relative"
                onClick={() => setHasUserInteracted(true)}
              >
                {/* Logo icon */}
                <div className="w-10 h-10 rounded-lg bg-gradient-primary/20 border border-primary/40 overflow-hidden flex items-center justify-center group-hover:border-primary/80 group-hover:bg-gradient-primary/30 transition-all duration-300">
                  <img src="/favicon.ico" alt="Logo" className="w-7 h-7 object-contain" />
                </div>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
              </a>

              {/* Audio Toggle Button */}
              <button
                onClick={togglePlayback}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-background/60 hover:bg-accent transition-all focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
                aria-label={isPlaying ? "Mute music" : "Play music"}
              >
                <div className={`transition-all duration-300 ${isPlaying ? 'scale-110 text-primary' : 'scale-90 text-muted-foreground'}`}>
                  {isPlaying ? (
                    <div className="relative">
                      <Volume2 size={20} />
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    </div>
                  ) : (
                    <VolumeX size={20} />
                  )}
                </div>
                {/* Visual Audio Waveform Animation (Subtle) */}
                {isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-1.5 pb-1 opacity-50">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-primary rounded-full animate-music-bar"
                        style={{ 
                          height: '100%',
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>

              <audio 
                ref={audioRef} 
                src={AUDIO_URL} 
                loop 
                preload="auto"
                muted={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleAudioError}
                onCanPlay={() => {
                  // Try autoplay once audio is ready
                  if (!isPlaying && !hasUserInteracted) {
                    audioRef.current?.play().catch(() => {
                      // This is expected to fail in strict browsers
                    });
                  }
                }}
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="group relative text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide font-medium"
                  onClick={() => setHasUserInteracted(true)}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </a>
              ))}

              <ThemeToggle />

              <Button variant="hero" size="sm" asChild>
                <a
                  href="https://drive.google.com/file/d/1N6ymRfrGlAjYNSuUumhj6nBNBBXsSj17/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setHasUserInteracted(true)}
                >
                  Resume
                </a>
              </Button>
            </div>

            {/* Mobile Icon Toggle */}
            <div className="flex items-center gap-4 md:hidden">
              <ThemeToggle />

              <button
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setHasUserInteracted(true);
                }}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-background/60 hover:bg-accent transition-all focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="absolute inset-0 grid place-items-center transition-all duration-300">
                  {isMobileMenuOpen ? (
                    <X size={22} className="transition-all scale-100" />
                  ) : (
                    <Menu size={22} className="transition-all scale-100" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          <div
            className={`md:hidden absolute left-0 right-0 top-16 z-50 border-t border-border bg-background shadow-xl transition-all duration-300 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-5 pointer-events-none"
            }`}
          >
            <div className="container mx-auto px-6 py-5 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setHasUserInteracted(true);
                  }}
                  className="text-foreground bg-muted/40 hover:bg-primary/10 border border-transparent hover:border-primary/20 px-4 py-3 rounded-xl text-sm tracking-wide font-medium text-center transition-all"
                >
                  {link.name}
                </a>
              ))}

              <Button
                variant="hero"
                size="sm"
                className="w-full rounded-xl font-semibold mt-3"
                asChild
              >
                <a
                  href="https://drive.google.com/file/d/1N6ymRfrGlAjYNSuUumhj6nBNBBXsSj17/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setHasUserInteracted(true)}
                >
                  Resume
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}