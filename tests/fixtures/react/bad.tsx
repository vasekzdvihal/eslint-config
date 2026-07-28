import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const TICK_MS = 500;

interface ListProps {
  items: string[];
  html: string;
}

export function BadList({ items, html }: ListProps): ReactNode {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setCount(count + 1), TICK_MS);
  }, []);

  return (
    <div>
      <img src="/logo.png" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <p>{count}</p>
    </div>
  );
}
