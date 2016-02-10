export function snapshotValue(snapshotOrValue) {
  if (typeof snapshotOrValue === 'object' && typeof snapshotOrValue.val === 'function') {
    return snapshotOrValue.val();
  }
  return snapshotOrValue;
}
