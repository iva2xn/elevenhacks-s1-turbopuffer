'use client';

import { Element, BASE_ELEMENTS } from '@/lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  discovered: Element[];
  onAddElement: (element: Element) => void;
}

export default function Sidebar({ discovered, onAddElement }: SidebarProps) {
  const allIDs = new Set();
  const allElements = [...BASE_ELEMENTS, ...discovered].filter(el => {
    if (allIDs.has(el.id)) return false;
    allIDs.add(el.id);
    return true;
  });


  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI-Chemy</h1>
        <p className={styles.subtitle}>{allElements.length} Elements Discovered</p>
      </div>
      <div className={styles.inventory}>
        {allElements.map((el) => (
          <div 
            key={el.id} 
            className={styles.item}
            onClick={() => onAddElement(el)}
          >
            <div 
              className={styles.itemIcon}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('elementId', el.id);
                e.dataTransfer.dropEffect = 'copy';
              }}
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
            <span className={styles.itemName}>{el.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
