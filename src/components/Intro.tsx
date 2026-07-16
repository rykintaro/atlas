interface Props {
  leaving: boolean;
  onSkip: () => void;
}

export function Intro({ leaving, onSkip }: Props) {
  return (
    <div className={`intro ${leaving ? "out" : ""}`} onClick={onSkip} role="presentation">
      <div className="intro-inner">
        <div className="intro-word" aria-label="Atlas">
          {[..."ATLAS"].map((char, i) => (
            <span key={i} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              {char}
            </span>
          ))}
        </div>
        <div className="intro-line" />
        <p className="intro-sub">Clarity for every day</p>
      </div>
    </div>
  );
}
