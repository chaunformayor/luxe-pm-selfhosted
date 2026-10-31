import type { Address } from './common/index';

// Luxe: US mailing format ("St. Louis, MO 63101"). Upstream printed the
// European order ("63101 St. Louis"). See LUXE.md.

type AddressParts = Partial<Address> | null | undefined;

/**
 * "City, ST 12345". Missing parts are dropped: "City, ST", "City 12345",
 * "ST 12345", or "" when all three are empty.
 */
export function formatCityStateZip(address: AddressParts): string {
  if (!address) {
    return '';
  }
  const stateZip = [address.state, address.zipCode].filter(Boolean).join(' ');
  return [address.city, stateZip].filter(Boolean).join(', ');
}

/** Non-empty address lines in US mailing order, ending with the country. */
export function formatAddressLines(address: AddressParts): string[] {
  if (!address) {
    return [];
  }
  return [
    address.street1,
    address.street2,
    formatCityStateZip(address),
    address.country
  ].filter((line): line is string => !!line);
}
