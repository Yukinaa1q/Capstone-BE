export const hasThreeMatchingAttributes = (
  array: any[],
  target: any,
): boolean => {
  return array.some((obj) => {
    const matchingKeys = Object.keys(target).filter(
      (key) => obj[key] === target[key],
    );
    return matchingKeys.length >= 3;
  });
};
