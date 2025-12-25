'use client';

import React, { useState } from 'react';
import { ExplainPacket } from '@/lib/types';

interface MetricExplainerProps {
  explain: ExplainPacket;
  isExpanded?: boolean;
}

/**
 * MetricExplainer Component
 *
 * Displays a detailed breakdown of how a metric was calculated.
 * This is the "explain mode" feature that helps users understand
 * the full calculation pipeline.
 */
export function MetricExplainer({ explain, isExpanded = false }: MetricExplainerProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="metric-explainer">
      {/* Header with metric name and value */}
      <div
        className="explainer-header"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#1a1a2e',
          borderRadius: expanded ? '8px 8px 0 0' : '8px',
          cursor: 'pointer',
          border: '1px solid #333',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
            {explain.metricName}
          </h3>
          <span style={{ color: '#888', fontSize: '14px' }}>
            Click to {expanded ? 'collapse' : 'expand'} explanation
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getRatingColor(explain.rating) }}>
            {explain.finalValue.toFixed(3)}
          </div>
          <div style={{ color: getRatingColor(explain.rating), fontSize: '14px' }}>
            {explain.rating}
          </div>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div
          className="explainer-content"
          style={{
            padding: '16px',
            backgroundColor: '#16213e',
            borderRadius: '0 0 8px 8px',
            border: '1px solid #333',
            borderTop: 'none',
          }}
        >
          {/* Inputs Section */}
          <section style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#4cc9f0', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              📊 Raw Inputs
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
              {Object.entries(explain.inputs).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    backgroundColor: '#1a1a2e',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#888', fontSize: '12px' }}>{key}</div>
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Weights Section */}
          {explain.weights && (
            <section style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#4cc9f0', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                ⚖️ Season Weights
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                {Object.entries(explain.weights).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      backgroundColor: '#1a1a2e',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: '#888', fontSize: '12px' }}>{key}</span>
                    <span style={{ color: '#f72585', fontWeight: 'bold' }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Steps Section */}
          <section style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#4cc9f0', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              🔢 Calculation Steps
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {explain.steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#1a1a2e',
                    padding: '12px',
                    borderRadius: '4px',
                    borderLeft: '4px solid #7209b7',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span
                      style={{
                        backgroundColor: '#7209b7',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', marginBottom: '4px' }}>{step.description}</div>
                      {step.formula && (
                        <code
                          style={{
                            display: 'block',
                            backgroundColor: '#0f0f23',
                            color: '#4cc9f0',
                            padding: '8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginTop: '8px',
                            overflowX: 'auto',
                          }}
                        >
                          {step.formula}
                        </code>
                      )}
                      {step.components && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '4px',
                            marginTop: '8px',
                          }}
                        >
                          {step.components.map((comp, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                                color: '#aaa',
                                padding: '4px 8px',
                                backgroundColor: '#0f0f23',
                                borderRadius: '2px',
                              }}
                            >
                              <span>{comp.name}</span>
                              <span style={{ color: '#4cc9f0', fontWeight: 'bold' }}>{comp.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: '8px',
                          color: '#4cc9f0',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}
                      >
                        → {typeof step.value === 'number' ? step.value.toFixed(3) : step.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notes Section */}
          {explain.notes.length > 0 && (
            <section style={{ marginBottom: '16px' }}>
              <h4 style={{ color: '#4cc9f0', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                📝 Notes
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#aaa' }}>
                {explain.notes.map((note, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Reference Link */}
          {explain.referenceUrl && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a
                href={explain.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#4cc9f0',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                📚 Learn more about {explain.metricName.split(' ')[0]} →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'Excellent':
      return '#00ff88';
    case 'Great':
      return '#00cc66';
    case 'Above Average':
      return '#66cc00';
    case 'Average':
      return '#ffcc00';
    case 'Below Average':
      return '#ff9900';
    case 'Poor':
      return '#ff6600';
    case 'Awful':
      return '#ff3300';
    default:
      return '#888';
  }
}

export default MetricExplainer;
