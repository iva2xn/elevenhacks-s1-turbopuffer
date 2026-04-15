'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Canvas from '@/components/Canvas';
import { Element, CanvasElement, BASE_ELEMENTS } from '@/lib/types';

export default function Home() {
  const [discovered, setDiscovered] = useState<Element[]>([]);
  const [activeElements, setActiveElements] = useState<CanvasElement[]>([]);

  const handleAddElement = (element: Element) => {
    const newInstance: CanvasElement = {
      ...element,
      instanceId: Math.random().toString(36).substr(2, 9),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200
    };
    setActiveElements(prev => [...prev, newInstance]);
  };

  const handleCombine = async (el1: CanvasElement, el2: CanvasElement) => {
    console.log('Attempting combination:', el1.name, '+', el2.name);

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

        // Remove the original elements
        setActiveElements(prev => prev.filter(
          el => el.instanceId !== el1.instanceId && el.instanceId !== el2.instanceId
        ));

        // Add to discovered if new
        setDiscovered(prev => {
          if (prev.find(d => d.id === resultElement.id)) return prev;
          return [...prev, resultElement];
        });

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
    } catch (error) {
      console.error('Failed to combine:', error);
    }
  };



  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar
        discovered={discovered}
        onAddElement={handleAddElement}
      />
      <Canvas
        activeElements={activeElements}
        setActiveElements={setActiveElements}
        onCombine={handleCombine}
      />
    </main>
  );
}
