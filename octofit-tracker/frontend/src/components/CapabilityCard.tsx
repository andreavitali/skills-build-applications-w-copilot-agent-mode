import { useEffect, useRef, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  emptyText: string;
  getItems: (payload: unknown) => T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, emptyText, getItems, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getItemsRef = useRef(getItems);
  getItemsRef.current = getItems;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const payload = await getJson<unknown>(endpoint);
        if (!active) return;
        setItems(getItemsRef.current(payload));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load data');
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    setError(null);
    void load();

    return () => {
      active = false;
    };
  }, [endpoint]);

  if (loading) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="status">Loading...</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><div role="alert">Unable to load {title.toLowerCase()}.</div></div></section>;
  }

  if (items.length === 0) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p>{emptyText}</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><ul className="list-unstyled mb-0">{items.map((item, index) => <li key={index}>{renderItem(item, index)}</li>)}</ul></div></section>;
}
