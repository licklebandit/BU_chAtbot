import React from 'react';

export function Card({ children }) {
  return <div className="bg-white p-4 rounded shadow">{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="font-bold text-lg mb-2">{children}</div>;
}

export function CardBody({ children }) {
  return <div>{children}</div>;
}
