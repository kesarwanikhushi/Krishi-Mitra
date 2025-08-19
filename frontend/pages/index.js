import { useState } from 'react';
import HomeCards from '../components/HomeCards';

export default function Home() {
  return (
    <div 
      className="min-vh-100 d-flex flex-column" 
      style={{
        paddingTop: 0, // Remove padding since TopNav is now in normal flow
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)'
      }}
    >
      <main className="flex-grow-1 py-4 px-3">
        <HomeCards />
      </main>
    </div>
  );
}
