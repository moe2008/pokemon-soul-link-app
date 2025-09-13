import { useState, useEffect } from "react";

export function Pokeball({
  size = 32,
  className = "",
  delay = 0,
}: {
  size?: number;
  className?: string;
  delay?: number; // in ms
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/item/poke-ball");
        const data = await res.json();
        const url =
          data?.sprites?.default ||
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        setSrc(url);
      } catch {
        // Fallback auf PokeAPI-Sprite-Repo
        setSrc(
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
        );
      }
    };
    run();
  }, []);

  return (
    <img
      src={src ?? ""}
      alt="Poké Ball"
      width={size}
      height={size}
      className={`inline-block drop-shadow-sm ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
