/**
 * Generates a unique ticket number
 * Format: BMS-YYYYMMDD-HHMMSS-XXXXX
 * Example: BMS-20231219-143025-A7F9E
 */
export function generateTicketNumber() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Generate a random 5-character alphanumeric string
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `BMS-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}
