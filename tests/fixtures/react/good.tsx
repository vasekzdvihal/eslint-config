import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const SHOW_DELAY_MS = 1000;

interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps): ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(setVisible, SHOW_DELAY_MS, true);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <p>
      Hello,
      {name}
    </p>
  );
}
