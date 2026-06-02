import { getJSON, setJSON, STORAGE_KEYS } from './storage';

function userKey(email) {
  return email.toLowerCase();
}

export function getAddressesForUser(email) {
  if (!email) return [];
  const all = getJSON(STORAGE_KEYS.ADDRESSES, {}) || {};
  return all[userKey(email)] || [];
}

export function saveAddressesForUser(email, addresses) {
  const all = getJSON(STORAGE_KEYS.ADDRESSES, {}) || {};
  all[userKey(email)] = addresses;
  setJSON(STORAGE_KEYS.ADDRESSES, all);
}

export function generateAddressId() {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function addAddress(email, address) {
  const list = getAddressesForUser(email);
  const isFirst = list.length === 0;
  const newAddr = {
    ...address,
    id: generateAddressId(),
    isDefault: address.isDefault ?? isFirst,
  };
  let updated = [...list, newAddr];
  if (newAddr.isDefault) {
    updated = updated.map((a) => ({ ...a, isDefault: a.id === newAddr.id }));
  }
  saveAddressesForUser(email, updated);
  return newAddr;
}

export function updateAddress(email, addressId, patch) {
  let list = getAddressesForUser(email).map((a) =>
    a.id === addressId ? { ...a, ...patch, id: addressId } : a
  );
  if (patch.isDefault) {
    list = list.map((a) => ({ ...a, isDefault: a.id === addressId }));
  }
  saveAddressesForUser(email, list);
  return list.find((a) => a.id === addressId);
}

export function deleteAddress(email, addressId) {
  let list = getAddressesForUser(email).filter((a) => a.id !== addressId);
  if (list.length && !list.some((a) => a.isDefault)) {
    list[0] = { ...list[0], isDefault: true };
  }
  saveAddressesForUser(email, list);
  return list;
}

export function getDefaultAddress(email) {
  const list = getAddressesForUser(email);
  return list.find((a) => a.isDefault) || list[0] || null;
}

export function seedDefaultAddresses(email) {
  if (!email || getAddressesForUser(email).length > 0) return;
  addAddress(email, {
    label: 'HOME',
    name: 'Home Address',
    line1: '12, Market Street',
    line2: 'Anna Nagar',
    city: 'Chennai',
    pincode: '600001',
    phone: '9876543210',
    isDefault: true,
  });
  addAddress(email, {
    label: 'OFFICE',
    name: 'Office Address',
    line1: '45, Tech Park, OMR',
    line2: 'Sholinganallur',
    city: 'Chennai',
    pincode: '600096',
    phone: '9876543211',
    isDefault: false,
  });
}
