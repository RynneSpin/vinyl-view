'use client';

import { useMemo } from 'react';
import type { Record } from '@/types/record';

interface FestivalPosterProps {
  records: Record[];
}

interface ArtistData {
  name: string;
  count: number;
}

export default function FestivalPoster({ records }: FestivalPosterProps) {
  const data = useMemo(() => {
    if (records.length === 0) return null;

    // Count records per artist
    const artistMap = new Map<string, ArtistData>();
    records.forEach((r) => {
      const existing = artistMap.get(r.artist);
      if (existing) {
        existing.count++;
      } else {
        artistMap.set(r.artist, { name: r.artist, count: 1 });
      }
    });

    // Sort artists by count
    const allArtists = Array.from(artistMap.values()).sort(
      (a, b) => b.count - a.count
    );

    // Get top genres
    const genreCounts = new Map<string, number>();
    records.forEach((r) => {
      r.genres.forEach((g) => {
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      });
    });
    const topGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return {
      headliners: allArtists.slice(0, 2),
      tier2: allArtists.slice(2, 5),
      tier3: allArtists.slice(5, 12),
      tier4: allArtists.slice(12, 22),
      tier5: allArtists.slice(22, 35),
      tier6: allArtists.slice(35, 50),
      genres: topGenres,
      totalArtists: allArtists.length,
      totalRecords: records.length,
    };
  }, [records]);

  if (!data || records.length === 0) {
    return null;
  }

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&family=Righteous&family=Bangers&family=Passion+One:wght@400;700;900&family=Alfa+Slab+One&display=swap"
        rel="stylesheet"
      />

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#1a1a2e',
        }}
      >
        {/* Sunburst rays background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            viewBox="0 0 400 400"
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[150%] h-auto opacity-20"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const colors = ['#ff6b35', '#f7c59f', '#efefd0'];
              return (
                <path
                  key={i}
                  d={`M200,200 L${200 + Math.cos(angle) * 400},${200 + Math.sin(angle) * 400}
                     A400,400 0 0,1 ${200 + Math.cos(angle + (7.5 * Math.PI) / 180) * 400},${200 + Math.sin(angle + (7.5 * Math.PI) / 180) * 400} Z`}
                  fill={colors[i % 3]}
                />
              );
            })}
          </svg>
        </div>

        {/* Decorative top border - colorful stripes */}
        <div className="h-3 sm:h-4 flex">
          {['#ff6b35', '#f7c59f', '#2ec4b6', '#e71d36', '#011627', '#ff6b35', '#f7c59f', '#2ec4b6'].map(
            (color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            )
          )}
        </div>

        <div className="relative p-4 sm:p-6 lg:p-8">
          {/* Presents banner */}
          <div className="text-center mb-2">
            <span
              className="inline-block px-4 py-1 text-xs sm:text-sm tracking-[0.3em]"
              style={{
                fontFamily: '"Righteous", cursive',
                color: '#f7c59f',
                borderBottom: '2px solid #ff6b35',
              }}
            >
              YOUR VINYL COLLECTION PRESENTS
            </span>
          </div>

          {/* Main Festival Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h2
              className="text-6xl sm:text-8xl lg:text-9xl leading-[0.85] tracking-tight"
              style={{
                fontFamily: '"Alfa Slab One", serif',
                color: '#efefd0',
                textShadow: `
                  4px 4px 0 #ff6b35,
                  8px 8px 0 #e71d36,
                  12px 12px 0 #011627
                `,
              }}
            >
              CRATE
            </h2>
            <h2
              className="text-5xl sm:text-7xl lg:text-8xl leading-[0.85] -mt-1 sm:-mt-2"
              style={{
                fontFamily: '"Bangers", cursive',
                color: '#2ec4b6',
                textShadow: '3px 3px 0 #011627',
                letterSpacing: '0.05em',
              }}
            >
              DIGGER
            </h2>
            <p
              className="text-2xl sm:text-3xl mt-1"
              style={{
                fontFamily: '"Permanent Marker", cursive',
                color: '#ff6b35',
              }}
            >
              FESTIVAL
            </p>
          </div>

          {/* Decorative divider with vinyl */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-4 sm:my-6">
            <div className="h-0.5 flex-1 max-w-20 sm:max-w-32 bg-gradient-to-r from-transparent to-[#ff6b35]" />
            <div className="relative w-10 h-10 sm:w-14 sm:h-14">
              <div className="absolute inset-0 rounded-full bg-[#011627] border-4 border-[#f7c59f]" />
              <div className="absolute inset-[35%] rounded-full bg-[#e71d36]" />
              <div className="absolute inset-[45%] rounded-full bg-[#011627]" />
            </div>
            <div className="h-0.5 flex-1 max-w-20 sm:max-w-32 bg-gradient-to-l from-transparent to-[#ff6b35]" />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 sm:gap-10 mb-6 sm:mb-8">
            <div className="text-center">
              <p
                className="text-3xl sm:text-5xl font-bold"
                style={{ fontFamily: '"Passion One", sans-serif', color: '#ff6b35' }}
              >
                {data.totalRecords}
              </p>
              <p className="text-[10px] sm:text-xs tracking-widest text-[#f7c59f]">RECORDS</p>
            </div>
            <div className="text-center">
              <p
                className="text-3xl sm:text-5xl font-bold"
                style={{ fontFamily: '"Passion One", sans-serif', color: '#2ec4b6' }}
              >
                {data.totalArtists}
              </p>
              <p className="text-[10px] sm:text-xs tracking-widest text-[#f7c59f]">ARTISTS</p>
            </div>
          </div>

          {/* Lineup section header */}
          <div className="text-center mb-4">
            <span
              className="inline-block px-6 py-2 rounded-full text-sm sm:text-base"
              style={{
                fontFamily: '"Righteous", cursive',
                backgroundColor: '#e71d36',
                color: '#efefd0',
                letterSpacing: '0.2em',
              }}
            >
              ★ THE LINEUP ★
            </span>
          </div>

          {/* HEADLINERS */}
          {data.headliners.length > 0 && (
            <div className="text-center mb-4 sm:mb-6">
              {data.headliners.map((artist, i) => (
                <p
                  key={artist.name}
                  className={`uppercase leading-none ${
                    i === 0 ? 'text-4xl sm:text-6xl lg:text-7xl mb-2' : 'text-3xl sm:text-5xl lg:text-6xl'
                  }`}
                  style={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    color: '#efefd0',
                    textShadow: '2px 2px 0 #ff6b35',
                  }}
                >
                  {artist.name}
                </p>
              ))}
            </div>
          )}

          {/* TIER 2 */}
          {data.tier2.length > 0 && (
            <div className="text-center mb-3 sm:mb-4">
              <p
                className="text-xl sm:text-3xl lg:text-4xl uppercase"
                style={{
                  fontFamily: '"Passion One", sans-serif',
                  color: '#2ec4b6',
                }}
              >
                {data.tier2.map((a) => a.name).join(' • ')}
              </p>
            </div>
          )}

          {/* TIER 3 */}
          {data.tier3.length > 0 && (
            <div className="text-center mb-3 sm:mb-4">
              <p
                className="text-base sm:text-xl lg:text-2xl uppercase"
                style={{
                  fontFamily: '"Righteous", cursive',
                  color: '#f7c59f',
                }}
              >
                {data.tier3.map((a) => a.name).join(' • ')}
              </p>
            </div>
          )}

          {/* TIER 4 */}
          {data.tier4.length > 0 && (
            <div className="text-center mb-3 sm:mb-4">
              <p
                className="text-sm sm:text-base lg:text-lg uppercase tracking-wide"
                style={{
                  fontFamily: '"Righteous", cursive',
                  color: '#e07850',
                }}
              >
                {data.tier4.map((a) => a.name).join(' • ')}
              </p>
            </div>
          )}

          {/* TIER 5 */}
          {data.tier5.length > 0 && (
            <div className="text-center mb-3 sm:mb-4">
              <p
                className="text-xs sm:text-sm lg:text-base uppercase tracking-wider"
                style={{
                  fontFamily: '"Passion One", sans-serif',
                  color: '#6bb8a8',
                  fontWeight: 400,
                }}
              >
                {data.tier5.map((a) => a.name).join(' • ')}
              </p>
            </div>
          )}

          {/* TIER 6 */}
          {data.tier6.length > 0 && (
            <div className="text-center mb-4 sm:mb-6">
              <p
                className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest"
                style={{
                  fontFamily: '"Righteous", cursive',
                  color: '#c9a87c',
                }}
              >
                {data.tier6.map((a) => a.name).join(' • ')}
              </p>
            </div>
          )}

          {/* Scallop pattern divider */}
          <div className="flex justify-center my-4 sm:my-6 overflow-hidden">
            <svg viewBox="0 0 200 20" className="w-full max-w-md h-5 sm:h-6">
              {Array.from({ length: 20 }, (_, i) => (
                <circle
                  key={i}
                  cx={i * 10 + 5}
                  cy={10}
                  r={8}
                  fill={['#ff6b35', '#2ec4b6', '#e71d36'][i % 3]}
                  opacity={0.6}
                />
              ))}
            </svg>
          </div>

          {/* Genres as "stages" */}
          {data.genres.length > 0 && (
            <div className="text-center">
              <p
                className="text-xs sm:text-sm mb-2 tracking-[0.2em]"
                style={{ color: '#f7c59f' }}
              >
                FEATURING
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {data.genres.map((genre, i) => {
                  const colors = ['#ff6b35', '#2ec4b6', '#e71d36'];
                  return (
                    <span
                      key={genre}
                      className="px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base font-bold uppercase"
                      style={{
                        fontFamily: '"Bangers", cursive',
                        backgroundColor: colors[i % 3],
                        color: '#011627',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {genre}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-[#ff6b3533]">
            <p
              className="text-center text-xs sm:text-sm"
              style={{
                fontFamily: '"Permanent Marker", cursive',
                color: '#f7c59f',
              }}
            >
              Artists ranked by records in collection
            </p>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="h-3 sm:h-4 flex">
          {['#2ec4b6', '#f7c59f', '#ff6b35', '#011627', '#e71d36', '#2ec4b6', '#f7c59f', '#ff6b35'].map(
            (color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            )
          )}
        </div>
      </div>
    </>
  );
}
