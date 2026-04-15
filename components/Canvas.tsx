'use client';

import { useState, useRef } from 'react';
import { Element, CanvasElement, BASE_ELEMENTS } from '@/lib/types';
import styles from './Canvas.module.css';

interface CanvasProps {
  activeElements: CanvasElement[];
  setActiveElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  onCombine: (el1: CanvasElement, el2: CanvasElement) => void;
}

export default function Canvas({ activeElements, setActiveElements, onCombine }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingInstance, setDraggingInstance] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // Center offset
    const y = e.clientY - rect.top - 40;

    const elementId = e.dataTransfer.getData('elementId');
    const sourceInstanceId = e.dataTransfer.getData('instanceId');

    if (sourceInstanceId) {
      // Existing element moved
      const moved = activeElements.find(el => el.instanceId === sourceInstanceId);
      if (moved) {
        setActiveElements(prev => prev.map(el => 
          el.instanceId === sourceInstanceId ? { ...el, x, y } : el
        ));
        checkCollisions(moved, x, y);
      }
    } else if (elementId) {
      // New element added from sidebar
      const baseEl = BASE_ELEMENTS.find(el => el.id === elementId);
      if (baseEl) {
        const newInstance: CanvasElement = {
          ...baseEl,
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
      if (dist < 70) { // Collision threshold increased
        onCombine(moved, other);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div 
      className={styles.canvas} 
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className={styles.backgroundText}>
        Combine the elements to discover secrets...
      </div>
      
      {activeElements.map((el) => (
        <div
          key={el.instanceId}
          className={styles.element}
          style={{ 
            transform: `translate(${el.x}px, ${el.y}px)`,
            opacity: draggingInstance === el.instanceId ? 0 : 1, // HIDE REMNANT
            pointerEvents: draggingInstance === el.instanceId ? 'none' : 'auto'
          }}
          onDoubleClick={() => {
            setActiveElements(prev => prev.filter(item => item.instanceId !== el.instanceId));
          }}
        >
          <div 
            className={styles.elementIcon}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('instanceId', el.instanceId);
              setDraggingInstance(el.instanceId);
              e.dataTransfer.setDragImage(e.currentTarget, 32, 32);
            }}
            onDragEnd={() => setDraggingInstance(null)}
          >
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
          {/* Element name removed for minimalist canvas */}
        </div>
      ))}

    </div>
  );
}
