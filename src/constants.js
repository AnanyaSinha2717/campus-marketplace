export const CATEGORIES = ['Books', 'Calculators', 'PYQ', 'Electronics', 'Other'];
export const CONDITIONS = ['New', 'Good', 'Used'];
export const COLORS = {
  primary: '#1565C0', danger: '#C62828', muted: '#757575',
  card: '#F5F5F5', border: '#DDDDDD', ok: '#2E7D32',
};
export const priceLabel = (l) => (l.type === 'Exchange' ? 'Exchange' : `₹${l.price}`);
export const myName = (user) => (user && (user.displayName || user.email)) || 'Student';
export const imageUri = (b64) => (b64 ? `data:image/jpeg;base64,${b64}` : null);
