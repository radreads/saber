'use client';

import React, { useState, useCallback } from 'react';
import { MetricExplainer } from '@/components/MetricExplainer';
import { HitterInputs, ExplainPacket } from '@/lib/types';
import { calculateWOBA, explainWOBA } from '@/lib/metrics';
import { getAvailableSeasons } from '@/lib/woba-weights';

// Sample data for demonstration - Shohei Ohtani 2024 (approximate)
const SAMPLE_DATA: HitterInputs = {
  AB: 636,
  BB: 81,
  IBB: 24,
  HBP: 7,
  singles: 103,
  doubles: 29,
  triples: 0,
  HR: 54,
  SF: 2,
};

export default function Home() {
  const [inputs, setInputs] = useState<HitterInputs>(SAMPLE_DATA);
  const [season, setSeason] = useState<number>(2024);
  const [showExplain, setShowExplain] = useState<boolean>(true);
  const [explainPacket, setExplainPacket] = useState<ExplainPacket | null>(() =>
    explainWOBA(SAMPLE_DATA, 2024)
  );

  const availableSeasons = getAvailableSeasons();

  const handleInputChange = useCallback(
    (field: keyof HitterInputs, value: string) => {
      const numValue = parseInt(value, 10) || 0;
      setInputs((prev) => ({ ...prev, [field]: numValue }));
    },
    []
  );

  const handleCalculate = useCallback(() => {
    const packet = explainWOBA(inputs, season);
    setExplainPacket(packet);
    setShowExplain(true);
  }, [inputs, season]);

  const handleLoadSample = useCallback(() => {
    setInputs(SAMPLE_DATA);
    setSeason(2024);
    setExplainPacket(explainWOBA(SAMPLE_DATA, 2024));
    setShowExplain(true);
  }, []);

  const woba = calculateWOBA(inputs, season);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #4cc9f0 0%, #f72585 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Saber
        </h1>
        <p style={{ color: '#888', fontSize: '18px' }}>
          Moneyball Dashboard - wOBA Calculator & Explain Mode
        </p>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Step 3: Understanding how wOBA is calculated
        </p>
      </header>

      {/* Introduction */}
      <section
        style={{
          backgroundColor: '#1a1a2e',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '32px',
          border: '1px solid #333',
        }}
      >
        <h2 style={{ color: '#4cc9f0', marginBottom: '12px' }}>What is wOBA?</h2>
        <p style={{ color: '#ccc', lineHeight: '1.8' }}>
          <strong>Weighted On-Base Average (wOBA)</strong> is a statistic that measures a hitter&apos;s
          overall offensive value. Unlike traditional stats like batting average, wOBA weights each
          type of hit by its actual run value. A home run contributes more than a single, and a walk
          has value too.
        </p>
        <p style={{ color: '#888', marginTop: '12px', fontSize: '14px' }}>
          The weights change each season based on league run environment. This calculator uses
          official FanGraphs weights for accurate computation.
        </p>
      </section>

      {/* Input Form */}
      <section
        style={{
          backgroundColor: '#16213e',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '32px',
          border: '1px solid #333',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#fff' }}>Input Hitter Stats</h2>
          <button
            onClick={handleLoadSample}
            style={{
              backgroundColor: '#333',
              padding: '8px 16px',
              fontSize: '14px',
            }}
          >
            Load Sample Data (Ohtani 2024)
          </button>
        </div>

        {/* Season Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>
            Season (for weights)
          </label>
          <select
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value, 10))}
            style={{ width: '200px' }}
          >
            {availableSeasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {[
            { key: 'AB', label: 'At Bats', desc: 'Official at bats' },
            { key: 'BB', label: 'Walks', desc: 'Base on balls' },
            { key: 'IBB', label: 'Int. Walks', desc: 'Intentional walks' },
            { key: 'HBP', label: 'Hit By Pitch', desc: 'Hit by pitch' },
            { key: 'singles', label: 'Singles', desc: '1B hits' },
            { key: 'doubles', label: 'Doubles', desc: '2B hits' },
            { key: 'triples', label: 'Triples', desc: '3B hits' },
            { key: 'HR', label: 'Home Runs', desc: 'HR' },
            { key: 'SF', label: 'Sac Flies', desc: 'Sacrifice flies' },
          ].map(({ key, label, desc }) => (
            <div key={key}>
              <label
                style={{
                  display: 'block',
                  color: '#888',
                  marginBottom: '4px',
                  fontSize: '12px',
                }}
                title={desc}
              >
                {label}
              </label>
              <input
                type="number"
                min="0"
                value={inputs[key as keyof HitterInputs] ?? 0}
                onChange={(e) => handleInputChange(key as keyof HitterInputs, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Calculate Button */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={handleCalculate} style={{ flex: '0 0 auto' }}>
            Calculate wOBA
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#888' }}>Current wOBA: </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#4cc9f0',
              }}
            >
              {woba.toFixed(3)}
            </span>
          </div>
        </div>
      </section>

      {/* Explain Mode Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#ccc',
          }}
        >
          <input
            type="checkbox"
            checked={showExplain}
            onChange={(e) => setShowExplain(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          Show Explain Mode (Learning Feature)
        </label>
      </div>

      {/* Metric Explainer */}
      {showExplain && explainPacket && (
        <MetricExplainer explain={explainPacket} isExpanded={true} />
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid #333',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
        }}
      >
        <p>
          Saber - A learning project for understanding full-stack development through baseball
          analytics.
        </p>
        <p style={{ marginTop: '8px' }}>
          wOBA weights from{' '}
          <a
            href="https://www.fangraphs.com/guts.aspx?type=cn"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4cc9f0' }}
          >
            FanGraphs
          </a>{' '}
          | Learn more about{' '}
          <a
            href="https://library.fangraphs.com/offense/woba/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4cc9f0' }}
          >
            wOBA
          </a>
        </p>
      </footer>
    </main>
  );
}
