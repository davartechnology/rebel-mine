'use client'

import { useState } from 'react'

interface NavbarProps {
  activePage: 'mine' | 'referral' | 'history'
  onPageChange: (page: 'mine' | 'referral' | 'history') => void
  balance: string
}

export default function Navbar({ activePage, onPageChange, balance }: NavbarProps) {
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'rgba(8,10,15,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '64px',
    }}>

      {/* LOGO */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '22px',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #e8192c, #ff3347)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '4px',
        cursor: 'pointer',
      }}>
        REBELONE
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: '#0d1018',
        borderRadius: '10px',
        padding: '4px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {[
          { id: 'mine', label: '⛏ Mine' },
          { id: 'referral', label: '👥 Référence' },
          { id: 'history', label: '📋 Historique' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id as 'mine' | 'referral' | 'history')}
            style={{
              padding: '8px 20px',
              borderRadius: '7px',
              cursor: 'pointer',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: 'none',
              background: activePage === tab.id
                ? 'linear-gradient(135deg, #e8192c, #cc1526)'
                : 'transparent',
              color: activePage === tab.id ? '#ffffff' : '#4a5568',
              transition: 'all 0.25s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BALANCE PILL */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#12151e',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '30px',
        padding: '8px 16px',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '13px',
        letterSpacing: '1px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#e8192c',
          boxShadow: '0 0 8px #e8192c',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ color: '#e8edf5' }}>{balance}</span>
        <span style={{ color: '#4a5568', fontSize: '10px', letterSpacing: '1px' }}>RBL</span>
      </div>

    </nav>
  )
}