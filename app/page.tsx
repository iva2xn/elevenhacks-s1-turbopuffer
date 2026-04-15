'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Canvas from '@/components/Canvas';
import { Element, CanvasElement, BASE_ELEMENTS } from '@/lib/types';

const FUN_FACTS = [
  "Honey never spoils. Archaeologists found edible 3,000-year-old honey!",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are officially berries, but strawberries aren't.",
  "The average cloud weighs about 1.1 million pounds.",
  "Sharks have been around longer than trees.",
  "A bolt of lightning is five times hotter than the sun's surface."
];

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timeout = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timeout);
    }, 30);
    return () => clearInterval(timeout);
  }, [text]);

  return <>{displayedText}</>;
}

export default function Home() {
  const [discovered, setDiscovered] = useState<Element[]>([]);
  const [activeElements, setActiveElements] = useState<CanvasElement[]>([]);
  const [isCombining, setIsCombining] = useState(false);
  const [discoveryElement, setDiscoveryElement] = useState<Element | null>(null);
  const [currentFact, setCurrentFact] = useState(FUN_FACTS[0]);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    if (isCombining) {
      const interval = setInterval(() => {
        setCurrentFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isCombining]);

  const handleAddElement = (element: Element) => {
    // Play element sound if available
    if (element.sound) {
      const audio = new Audio(element.sound);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }

    const newInstance: CanvasElement = {
      ...element,
      instanceId: Math.random().toString(36).substr(2, 9),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200
    };
    setActiveElements(prev => [...prev, newInstance]);
  };

  const handleCombine = async (el1: CanvasElement, el2: CanvasElement) => {
    setIsCombining(true);
    const startTime = Date.now();
    setCurrentFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

    try {
      const usedIcons = [...BASE_ELEMENTS, ...discovered]
        .map(el => el.emoji || '')
        .filter(Boolean);

      const response = await fetch('/api/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementA: el1.name,
          elementB: el2.name,
          usedIcons
        }),
      });

      const data = await response.json();

      if (data.result) {
        const resultElement: Element = data.result;

        // Check if it's a first discovery
        const isNew = !discovered.some(d => d.id === resultElement.id);

        if (resultElement.sound) {
          const audio = new Audio(resultElement.sound);
          audio.volume = 0.5;
          audio.play().catch(e => console.warn('Sound playback failed:', e));
        }

        setActiveElements(prev => prev.filter(
          el => el.instanceId !== el1.instanceId && el.instanceId !== el2.instanceId
        ));

        if (isNew) {
          setDiscovered(prev => [...prev, resultElement]);
          setDiscoveryElement(resultElement);
        } else {
          // Add to canvas at collision point
          const midX = (el1.x + el2.x) / 2;
          const midY = (el1.y + el2.y) / 2;
          setActiveElements(prev => [...prev, {
            ...resultElement,
            instanceId: Math.random().toString(36).substr(2, 9),
            x: midX,
            y: midY
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to combine:', error);
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise(r => setTimeout(r, 3000 - elapsed));
      }
      setIsCombining(false);
    }
  };

  const handleExplain = async () => {
    if (!discoveryElement || isExplaining) return;
    setIsExplaining(true);
    
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementId: discoveryElement.id,
          name: discoveryElement.name,
          description: discoveryElement.description
        }),
      });
      const data = await response.json();
      if (data.songUrl) {
        const audio = new Audio(data.songUrl);
        audio.play();
        // Update discovered state with the song URL
        setDiscovered(prev => prev.map(d => 
          d.id === discoveryElement.id ? { ...d, explanationSong: data.songUrl } : d
        ));
      }
    } catch (err) {
      console.error('Explain failed:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDeleteElement = async (id: string) => {
    if (!confirm('Permanently delete this discovery from the database?')) return;
    
    // Remove from local state
    setDiscovered(prev => prev.filter(el => el.id !== id));
    setActiveElements(prev => prev.filter(el => el.id !== id));

    try {
      await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--background)' }}>
      <Sidebar
        discovered={discovered}
        onAddElement={handleAddElement}
        onDeleteElement={handleDeleteElement}
      />
      <Canvas
        activeElements={activeElements}
        discovered={discovered}
        setActiveElements={setActiveElements}
        onCombine={handleCombine}
      />

      {/* Loading Overlay */}
      {isCombining && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(27, 20, 17, 0.9)', zIndex: 1000, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff',
          textAlign: 'center', padding: '2rem', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <p style={{ 
            maxWidth: '600px', fontSize: '1.5rem', fontStyle: 'italic', 
            opacity: 0.8, lineHeight: 1.6, fontFamily: 'var(--font-serif)',
            animation: 'fadeOut 0.5s ease 2.5s forwards'
          }}>
            "<TypewriterText text={currentFact} />"
          </p>
        </div>
      )}

      {/* Discovery Overlay */}
      {discoveryElement && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(27, 20, 17, 0.95)', zIndex: 1100, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.5s ease', backdropFilter: 'blur(10px)',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '320px', width: '80%', aspectRatio: '1/1', marginBottom: '2rem',
            animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            filter: 'drop-shadow(0 0 30px var(--accent-glow))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
             {discoveryElement.emoji ? (
                <span style={{ fontSize: '12rem', display: 'block', textAlign: 'center' }}>{discoveryElement.emoji}</span>
              ) : discoveryElement.svg ? (
                <div 
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{ __html: discoveryElement.svg }} 
                />
              ) : null}
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', opacity: 0.7 }}>
            New Discovery
          </h2>
          <h1 style={{ color: '#F8F4EE', fontSize: '4.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
            {discoveryElement.name}
          </h1>
          <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '3rem', maxWidth: '500px', textAlign: 'center' }}>
            "{discoveryElement.description}"
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button 
              onClick={handleExplain}
              disabled={isExplaining}
              style={{
                padding: '1.2rem 2.5rem', background: '#F8F4EE', color: '#1B1411',
                borderRadius: '8px', fontSize: '1rem', fontWeight: 700,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer', border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
              }}
            >
              {isExplaining ? 'COMPOSING SONG...' : 'EXPLAIN'}
            </button>
            <button 
              onClick={() => {
                const midX = window.innerWidth / 2;
                const midY = window.innerHeight / 2;
                setActiveElements(prev => [...prev, {
                  ...discoveryElement,
                  instanceId: Math.random().toString(36).substr(2, 9),
                  x: midX - 250,
                  y: midY - 100
                }]);
                setDiscoveryElement(null);
              }}
              style={{
                padding: '1.2rem 2.5rem', background: 'transparent', color: '#F8F4EE',
                border: '1px solid rgba(248, 244, 238, 0.3)', borderRadius: '8px', fontSize: '1rem',
                cursor: 'pointer', transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 244, 238, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              CONTINUE JOURNEY
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes popIn { 
          0% { transform: scale(0.5); opacity: 0; } 
          100% { transform: scale(1); opacity: 1; } 
        }
      `}</style>
    </main>
  );
}
