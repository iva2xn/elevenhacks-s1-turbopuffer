'use client';

import { useState, useRef } from 'react';
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
            opacity: draggingInstance === el.instanceId ? 0 : 1,
            pointerEvents: draggingInstance === el.instanceId ? 'none' : 'auto'
          }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('instanceId', el.instanceId);
            setDraggingInstance(el.instanceId);
            // Use a custom drag image to avoid the "ghosting" look of the whole div
            const icon = e.currentTarget.querySelector(`.${styles.elementIcon}`);
            if (icon) {
              e.dataTransfer.setDragImage(icon, 32, 32);
            }
          } }
          onDragEnd={() => setDraggingInstance(null)}
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
