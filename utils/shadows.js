// utils/shadows.js
export const createShadow = (elevation = 5) => {
  return {
    boxShadow: `0px ${elevation / 2}px ${elevation}px rgba(0, 0, 0, 0.25)`
  };
};

// Usage
<View style={createShadow(5)} />