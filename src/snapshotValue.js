export function snapshotValue(snapshotOrValue) {
  if (snapshotOrValue
    && typeof snapshotOrValue === 'object'
    && typeof snapshotOrValue.val === 'function') {
    return snapshotOrValue.val();
  }
  return snapshotOrValue;
}
