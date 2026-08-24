let counter = 0;

export const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const millis = Date.now() % 100000;
  counter = (counter + 1) % 1000;
  const seq = String(millis).padStart(5, '0');

  return `ORD${dateStr}${seq}`;
};
