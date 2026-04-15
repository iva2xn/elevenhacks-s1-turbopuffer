'use client';

import { useState, useRef, useEffect } from 'react';
import { Element, CanvasElement, BASE_ELEMENTS } from '@/lib/types';
import styles from './Canvas.module.css';

interface CanvasProps {
  activeElements: CanvasElement[];
  discovered: Element[];
  setActiveElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  onCombine: (el1: CanvasElement, el2: CanvasElement) => void;
}

export default function Canvas({ activeElements, discovered, setActiveElements, onCombine }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingInstance, setDraggingInstance] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    e.preventDefault();
    setDraggingInstance(el.instanceId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - el.x,
        y: e.clientY - rect.top - el.y
      });
    }
    
    // Set pointer capture to track the drag even if it leaves the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingInstance || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    setActiveElements(prev => prev.map(el => 
      el.instanceId === draggingInstance ? { ...el, x: newX, y: newY } : el
    ));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingInstance) return;

    const moved = activeElements.find(el => el.instanceId === draggingInstance);
    if (moved) {
      checkCollisions(moved, moved.x, moved.y);
    }
    
    setDraggingInstance(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; 
    const y = e.clientY - rect.top - 40;

    const elementId = e.dataTransfer.getData('elementId');

    if (elementId) {
      const allPossible = [...BASE_ELEMENTS, ...discovered];
      const foundEl = allPossible.find(el => el.id === elementId);
      if (foundEl) {
        const newInstance: CanvasElement = {
          ...foundEl,
          instanceId: Math.random().toString(36).substr(2, 9),
          x,
          y
        };
        setActiveElements(prev => [...prev, newInstance]);
        checkCollisions(newInstance, x, y);
      }
    }
  };

  const checkCollisions = (moved: CanvasElement, x: number, y: number) => {
    activeElements.forEach(other => {
      if (other.instanceId === moved.instanceId) return;

      const dist = Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
      if (dist < 80) { // Slightly larger threshold for better mobile feel
        onCombine(moved, other);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className={styles.canvas} 
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPointerMove={handlePointerMove}
    >
      <div className={styles.backgroundText}>
        Combine elements to discover secrets...
      </div>
      
       {activeElements.map((el) => (
        <div
          key={el.instanceId}
          className={styles.element}
          style={{ 
            transform: `translate(${el.x}px, ${el.y}px)`,
            zIndex: draggingInstance === el.instanceId ? 100 : 1,
            touchAction: 'none' // CRITICAL for mobile dragging
          }}
          onPointerDown={(e) => handlePointerDown(e, el)}
          onPointerUp={handlePointerUp}
          onDoubleClick={() => {
            setActiveElements(prev => prev.filter(item => item.instanceId !== el.instanceId));
          }}
        >
          <div className={styles.elementIcon}>
            {el.emoji ? (
              <span>{el.emoji}</span>
            ) : el.svg ? (
              <div 
                className={styles.svgWrapper} 
                dangerouslySetInnerHTML={{ __html: el.svg }} 
              />
            ) : (
              el.name[0]
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
